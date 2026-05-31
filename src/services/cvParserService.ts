import type { CVProfile } from "../types";
import { mockUserProfile } from "../data/mockUserProfile";

export interface ICVParserService {
  parse(file: File): Promise<CVProfile>;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const cvParserService: ICVParserService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async parse(_file: File): Promise<CVProfile> {
    await delay(1500);
    return mockUserProfile;
  },
};
