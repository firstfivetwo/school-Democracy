exports.handler = async (event) => {
  const { code } = JSON.parse(event.body);
  const correctCode = process.env.SCHOOL_CODE;

  if (code === correctCode) {
    return { statusCode: 200, body: JSON.stringify({ valid: true }) };
  } else {
    return { statusCode: 401, body: JSON.stringify({ valid: false }) };
  }
};