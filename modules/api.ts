import dotenv from "dotenv";
dotenv.config();

export const DEFINED_URL = "https://graph.defined.fi/graphql";
export const DEFINED_HEADERS = {
  headers: {
    "Content-Type": "application/json",
    Authorization: "151824a9003347dc62785356c8639af8ba4bf4fe",
  },
};
