// Modelos y DTOs de User.
// Este archivo define la forma de los datos de usuario que viajan entre capas.

export type UserRole = 'ADMIN' | 'MAINTENANCE' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserModel {
	id: string;
	name: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	status: UserStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateUserDTO {
	name: string;
	email: string;
	password: string;
	role: UserRole;
	status?: UserStatus;
}

export interface UserResponseDTO {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	status: UserStatus;
	createdAt: Date;
	updatedAt: Date;
}
