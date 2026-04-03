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
  documentId: string;
  title: string;
  content: string;
  yjsState?: Buffer;
  ownerId: string;
  shareToken?: string;
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
  historyId: string;
  documentId: string;
  editedBy: string;
  changes?: string;
  content?: string;
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

interface IActivityLog {
  logId: string;
  documentId: string;
  userId: string;
  action: 'joined' | 'left' | 'edited' | 'commented' | 'restored' | 'invited' | 'removed';
  metadata?: string;
  timestamp?: Date;
}

interface IInvitation {
  invitationId: string;
  documentId: string;
  inviteeUserId: string;
  invitedBy: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: Date;
}

interface ICommentReply {
  replyId: string;
  userId: string;
  content: string;
  createdAt?: Date;
}

interface IComment {
  commentId: string;
  documentId: string;
  userId: string;
  selectedText?: string;
  rangeStart?: number;
  rangeEnd?: number;
  content: string;
  isResolved?: boolean;
  replies?: ICommentReply[];
  createdAt?: Date;
  updatedAt?: Date;
}

export {
  IUser,
  IDocument,
  IDocumentMember,
  IDocumentHistory,
  IOtp,
  IActivityLog,
  IInvitation,
  ICommentReply,
  IComment
};