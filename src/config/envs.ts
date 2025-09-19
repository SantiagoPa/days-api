import 'dotenv/config.js';

import { get } from 'env-var';

export const envs = {
    
    PORT: get("PORT").required().asPortNumber(),
}