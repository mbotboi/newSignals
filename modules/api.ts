import dotenv from "dotenv";
dotenv.config();

export const DEFINED_URL = "https://graph.defined.fi/graphql";
export const DEFINED_HEADERS = {
  headers: {
    "Content-Type": "application/json",
    Authorization: "974145e9bcbd7a3c64ae1065a4c875b6375e504e",
  },
};
