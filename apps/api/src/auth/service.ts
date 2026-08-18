import { createUser, getUserByUsername } from "../users/service";
import { hashPassword } from "./password";
import type { RegisterUserInput } from "./validation";

type PublicUser = {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

type RegisterUserResult =
  | {
      success: true;
      user: PublicUser;
    }
  | {
      success: false;
      message: string;
    };

function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(
  input: RegisterUserInput,
): Promise<RegisterUserResult> {
  const username = input.username.trim();

  const existingUser = getUserByUsername(username);

  if (existingUser !== undefined) {
    return {
      success: false,
      message: "Username is already taken.",
    };
  }

  const passwordHash = await hashPassword(input.password);
  const user = createUser({
    username,
    passwordHash,
  });

  return {
    success: true,
    user: toPublicUser(user),
  };
}
