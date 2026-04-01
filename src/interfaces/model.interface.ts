interface IUser {
  userId?: string;
  name?: string;
  email?: string;
  password?: string;
  googleId?: string;
  profilePicture?: string;
  isManualAuth?: boolean;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IDocument {
  documentId?: string;
  title?: string;
  content?: string;
  ownerId?: string;
  lastEditedBy?: string;
  lastEditedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IDocumentMember {
  memberId?: string;
  documentId?: string;
  userId?: string;
  role?: 'owner' | 'editor' | 'viewer';
  invitedBy?: string;
  invitedAt?: Date;
}

interface IDocumentHistory {
  historyId?: string;
  documentId?: string;
  editedBy?: string;
  changes?: string;
  cursorPosition?: number;
  version?: number;
  timestamp?: Date;
}

interface IOtp {
  otpId?: string;
  email?: string;
  otp?: string;
  name?: string;
  password?: string;
  expiresAt?: Date;
  createdAt?: Date;
}

export {IUser, IDocument, IDocumentMember, IDocumentHistory, IOtp}