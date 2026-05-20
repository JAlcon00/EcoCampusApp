// Modelos y DTOs de Alert.
// Este archivo representa alertas del sistema y sus estados.

export type AlertType = 'HIGH_CONSUMPTION' | 'EMPTY_ROOM_CONSUMPTION' | 'SENSOR_INACTIVE' | 'ABNORMAL_READING';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'IGNORED';

export interface AlertModel {
	id: string;
	type: AlertType;
	title: string;
	description: string | null;
	severity: AlertSeverity;
	status: AlertStatus;
	buildingId: string | null;
	classroomId: string | null;
	sensorId: string | null;
	readingId: string | null;
	resolvedByUserId: string | null;
	detectedAt: Date;
	resolvedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateAlertDTO {
	type: AlertType;
	title: string;
	description?: string | null;
	severity: AlertSeverity;
	status?: AlertStatus;
	buildingId?: string | null;
	classroomId?: string | null;
	sensorId?: string | null;
	readingId?: string | null;
	resolvedByUserId?: string | null;
	detectedAt: Date;
	resolvedAt?: Date | null;
}
