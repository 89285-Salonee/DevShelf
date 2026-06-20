function isAdmin(req) {
  return req.user?.role === 'admin';
}

function sameId(left, right) {
  if (!left || !right) return false;
  return left.toString() === right.toString();
}

function buildReadableFilter(req) {
  if (isAdmin(req)) return {};

  const visibleToPublic = [
    { visibility: 'public' },
    { visibility: { $exists: false } },
  ];

  if (req.user) {
    visibleToPublic.push({ createdBy: req.user._id });
  }

  return {
    isAdminOnly: { $ne: true },
    $or: visibleToPublic,
  };
}

function canReadDocument(doc, req) {
  if (!doc) return false;
  if (isAdmin(req)) return true;
  if (doc.isAdminOnly) return false;

  const isPublic = !doc.visibility || doc.visibility === 'public';
  const isOwner = req.user && sameId(doc.createdBy, req.user._id);

  return isPublic || isOwner;
}

function canManageDocument(doc, req) {
  if (!doc || !req.user) return false;
  if (isAdmin(req)) return true;

  return sameId(doc.createdBy, req.user._id);
}

function pickVisibility(value, fallback) {
  if (['public', 'private'].includes(value)) return value;
  return fallback;
}

function pickScope(value, fallback) {
  if (['personal', 'global'].includes(value)) return value;
  return fallback;
}

function buildCollectionPayload(req, body, existing = {}) {
  const payload = {
    name: body.name,
    description: body.description,
    baseUrl: body.baseUrl,
    color: body.color,
  };

  if (isAdmin(req)) {
    payload.scope = pickScope(body.scope, existing.scope || 'global');
    payload.visibility = pickVisibility(body.visibility, existing.visibility || 'public');
    payload.isAdminOnly = Boolean(body.isAdminOnly);
    payload.createdBy = existing.createdBy || req.user._id;
  } else {
    payload.scope = 'personal';
    payload.visibility = pickVisibility(body.visibility, existing.visibility || 'private');
    payload.isAdminOnly = false;
    payload.createdBy = existing.createdBy || req.user._id;
  }

  return payload;
}

function buildEndpointPayload(req, body, collection, existing = {}) {
  const payload = {
    collectionId: body.collectionId || existing.collectionId,
    name: body.name,
    url: body.url,
    method: body.method,
    headers: body.headers,
    body: body.body,
    notes: body.notes,
  };

  if (isAdmin(req)) {
    payload.scope = pickScope(body.scope, existing.scope || collection?.scope || 'global');
    payload.visibility = pickVisibility(
      body.visibility,
      existing.visibility || collection?.visibility || 'public'
    );
    payload.isAdminOnly = Boolean(body.isAdminOnly || collection?.isAdminOnly);
    payload.createdBy = existing.createdBy || req.user._id;
  } else {
    payload.scope = 'personal';
    payload.visibility = pickVisibility(body.visibility, existing.visibility || 'private');
    payload.isAdminOnly = false;
    payload.createdBy = existing.createdBy || req.user._id;
  }

  return payload;
}

module.exports = {
  isAdmin,
  buildReadableFilter,
  canReadDocument,
  canManageDocument,
  buildCollectionPayload,
  buildEndpointPayload,
};
