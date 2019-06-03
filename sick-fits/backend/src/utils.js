function hasPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  );
  if (!matchedPermissions.length) {
    throw new Error(`You do not have sufficient permissions

      : ${permissionsNeeded}

      You Have:

      ${user.permissions}
      `);
  }
}

const checkLoggedIn = (request, requiredKey = 'userID') => {
  if (!request[requiredKey]) {
    throw new Error('You must be logged in to do that')
  }
}

const setTokenOnCookie = (response, token) => {
  response.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365
  })
}

exports.setTokenOnCookie = setTokenOnCookie
exports.checkLoggedIn = checkLoggedIn
exports.hasPermission = hasPermission;
