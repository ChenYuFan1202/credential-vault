import {
  createUser,
  getUserById,
  getUserByUsername,
  updateUserPasswordHash,
} from "../users/service";
import { hashPassword, verifyPassword } from "./password";
import type {
  ChangePasswordInput,
  LoginUserInput,
  RegisterUserInput,
} from "./validation";

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

type LoginUserResult =
  | {
      success: true;
      user: PublicUser;
    }
  | {
      success: false;
      message: string;
    };

type ChangePasswordResult =
  | {
      success: true;
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

export async function loginUser(
  input: LoginUserInput,
): Promise<LoginUserResult> {
  const username = input.username.trim();
  const user = getUserByUsername(username);

  if (user === undefined) {
    return {
      success: false,
      message: "Invalid username or password.",
    };
  }

  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    return {
      success: false,
      message: "Invalid username or password.",
    };
  }

  return {
    success: true,
    user: toPublicUser(user),
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

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
  const user = getUserById(userId);

  if (user === undefined) {
    return {
      success: false,
      message: "User could not be found.",
    };
  }

  const isCurrentPasswordValid = await verifyPassword(
    input.currentPassword,
    user.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    return {
      success: false,
      message: "Current password is incorrect.",
    };
  }

  const passwordHash = await hashPassword(input.newPassword);
  updateUserPasswordHash(user.id, passwordHash);

  return {
    success: true,
  };
}
