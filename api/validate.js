export default function handler(request, response) {
  const { code } = request.body;
  const correctCode = process.env.SCHOOL_CODE;

  if (code === correctCode) {
    return response.status(200).json({ valid: true });
  } else {
    return response.status(401).json({ valid: false });
  }
}