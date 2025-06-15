function checkBody(body, keys) {
  let isValid = true;
  // Si un champs et vide ou false , return false
  for (const field of keys) {
    if (!body[field] || body[field] === "") {
      isValid = false;
    }
  }

  return isValid;
}

module.exports = { checkBody };
