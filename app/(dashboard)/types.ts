export enum REVIEW_ERROR {
    MISSING_FIELD = 'MISSING_FIELD',
    COMMENT_ALREADY_LEFT = 'COMMENT_ALREADY_LEFT'
}

export type ReviewApiResponse = 
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: REVIEW_ERROR | string;
      details?: any;
    };
