import {
    exampleRegisterHotel,
    exampleRegisterCharity,
    exampleLogin,
    exampleLogout,
    exampleCheckLogin,
    exampleGetCurrentUser,
    exampleAuthenticatedRequest,
    exampleCompleteLoginFlow,
    exampleCompleteRegistrationFlow
} from '../claude_impl/auth_impl.js';

// Or import the direct API functions
import { login, register, logout, getCurrentUser } from './auth_api.js';

// Use examples
await exampleLogin();

// Or use API directly
const result = await login({
    email: "user@example.com",
    password: "password123"
});