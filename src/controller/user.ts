import { Response, Request } from "express";
//LOGIN
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    console.log("Data:", { email, password });

    return res.status(200).send({ success: true });
  } catch (err) {
    res.status(500);
    return res.status(500).send({ success: false });
  }
};
