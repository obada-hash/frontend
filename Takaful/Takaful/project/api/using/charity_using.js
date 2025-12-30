import {
    exampleGetCharityById,
    exampleGetCharityByUserId,
    exampleGetAllCharities,
    exampleUpdateCharity,
    exampleDeleteCharity,
    exampleSearchCharitiesByName,
    exampleSearchCharitiesByAddress,
    exampleSearchAllCharities,
    exampleGetCharityWithStats,
    exampleCompleteUpdateFlow
} from '../claude_impl/charity_impl.js';

// Or import the direct API functions
import { getCharityById, searchCharities, updateCharity } from './charity_api.js';

// Use examples
await exampleGetAllCharities();

// Or use API directly
const charities = await searchCharities({ name: 'Hope' });
console.log(charities);