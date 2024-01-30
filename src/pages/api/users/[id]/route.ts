import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'PUT':
      // TODO: Update the user with the given id
      res.status(200).json({ message: `User ${id} updated` });
      break;
    case 'DELETE':
      // TODO: Delete the user with the given id
      res.status(200).json({ message: `User ${id} deleted` });
      break;
    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
