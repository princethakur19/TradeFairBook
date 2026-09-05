const getDatabaseErrorMessage = (error) => {
  const message = String(error?.message || "");

  if (/bad auth|authentication failed/i.test(message)) {
    return "Database login failed. Please check the MongoDB username and password configured on the server.";
  }

  if (/querySrv|ENOTFOUND|ETIMEOUT|ECONNREFUSED|buffering timed out|before initial connection|network/i.test(message)) {
    return "Database connection failed. Please check the MongoDB connection string and Atlas network access.";
  }

  if (/MONGO_URI is missing/i.test(message)) {
    return "Database connection is not configured.";
  }

  return "Database connection failed. Please try again later.";
};

module.exports = {
  getDatabaseErrorMessage
};
