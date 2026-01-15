import { success, fail } from "../../utils/response.js";
import {
  createPublicLink,
  listShares,
  resolvePublicLink,
  revokeShare,
  shareResource,
  shareByEmail,
} from "./share.service.js";
import { sendShareEmail } from "./share.email.js";

export const share = async (req, res, next) => {
  try {
    const shareRecord = await shareResource(req.user.id, req.body);
    
    // Send email notification if requested
    if (req.body.sendEmail && req.body.recipientEmail) {
      try {
        const senderName = req.user.name || req.user.email || 'Someone';
        const itemName = req.body.itemName || 'an item';
        const itemType = req.body.resourceType || 'file';
        const shareLink = req.body.shareLink || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${shareRecord.id}`;
        const role = req.body.role || 'Viewer';
        
        await sendShareEmail(
          req.body.recipientEmail,
          senderName,
          itemName,
          itemType,
          shareLink,
          role
        );
      } catch (emailError) {
        // Log error but don't fail the share operation
        console.error('Failed to send share email:', emailError);
      }
    }
    
    return success(res, { share: shareRecord }, 201);
  } catch (err) {
    if (err.message === "Forbidden") return fail(res, err.message, 403);
    return next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const { resourceType, resourceId } = req.query;
    const shares = await listShares(req.user.id, resourceType, Number(resourceId));
    return success(res, { shares });
  } catch (err) {
    return next(err);
  }
};

export const revoke = async (req, res, next) => {
  try {
    const { resourceType, resourceId, targetUserId } = req.body;
    const revoked = await revokeShare(
      req.user.id,
      resourceType,
      Number(resourceId),
      Number(targetUserId)
    );
    return success(res, { share: revoked });
  } catch (err) {
    return next(err);
  }
};

export const createLink = async (req, res, next) => {
  try {
    const { resourceType, resourceId, expiresAt } = req.body;
    const link = await createPublicLink(
      req.user.id,
      resourceType,
      Number(resourceId),
      expiresAt ? new Date(expiresAt) : null
    );
    return success(res, { link: { token: link.token, expiresAt: link.expires_at } });
  } catch (err) {
    return next(err);
  }
};

export const accessLink = async (req, res, next) => {
  try {
    const link = await resolvePublicLink(req.params.token);
    if (!link) return fail(res, "Link expired or invalid", 404);
    return success(res, { link });
  } catch (err) {
    return next(err);
  }
};

/**
 * Share by email - sends file/folder directly to email addresses
 * POST /api/shares/email
 */
export const shareByEmailController = async (req, res, next) => {
  try {
    const { resourceType, resourceId, recipientEmails, role = 'VIEWER', itemName } = req.body;
    
    if (!resourceType || !resourceId || !recipientEmails || !Array.isArray(recipientEmails)) {
      return fail(res, "resourceType, resourceId, and recipientEmails (array) are required", 400);
    }
    
    const senderName = req.user.name || req.user.email || 'Someone';
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const results = [];
    const errors = [];
    
    // Process each email
    for (const email of recipientEmails) {
      try {
        // Share by email (creates link and share record if user exists)
        // resourceId can be UUID string or integer - pass as-is
        const shareResult = await shareByEmail(
          req.user.id,
          resourceType,
          resourceId, // Don't convert to Number - keep as string for UUIDs
          email,
          role
        );
        
        // Generate share link
        const shareLink = `${baseUrl}/share/${shareResult.linkToken}`;
        
        // Send email notification
        try {
          await sendShareEmail(
            email,
            senderName,
            itemName || 'an item',
            resourceType,
            shareLink,
            role
          );
          results.push({ email, success: true, shareLink });
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
          // Still return success for sharing, but note email failure
          results.push({ email, success: true, shareLink, emailSent: false });
        }
      } catch (error) {
        console.error(`Failed to share with ${email}:`, error);
        const errorMessage = error.message || 'Unknown error occurred';
        errors.push({ email, error: errorMessage });
        // Don't add to results if it failed
      }
    }
    
    const successCount = results.length;
    const failCount = errors.length;
    
    return success(res, { 
      results,
      errors: errors.length > 0 ? errors : undefined,
      message: failCount > 0 
        ? `Shared with ${successCount} recipient(s), but ${failCount} failed`
        : `Shared with ${successCount} recipient(s)`
    }, failCount === recipientEmails.length ? 207 : 201); // 207 Multi-Status if some failed
  } catch (err) {
    return next(err);
  }
};

