export interface User {
  id: string;
  fullname: string;
  telegram_username?: string;
  phone_number: string;
  role: 'student' | 'teacher';
  last_activity?: string;
}

export interface StudentProfile {
  id: string;
  user: User;
  balance: string;
  type: string;
  is_approved: boolean;
  is_offline: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: string;
  user: User;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: string;
  title: string;
  price: string;
  created_at: string;
  purchased?: boolean;
}

export interface UserTest {
  id: string;
  test: Test;
  status: 'not_started' | 'in_progress' | 'completed';
  price_paid: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface TestResult {
  id: string;
  user_test: UserTest;
  listening_score?: number;
  reading_score?: number;
  writing_score?: number;
  overall_score?: number;
  feedback?: string;
  errors_analysis?: any;
  created_at: string;
}

export interface Payment {
  id: string;
  student: string;
  provider: string;
  status: 'created' | 'pending' | 'paid' | 'failed' | 'canceled';
  is_paid: boolean;
  amount: string;
  currency: string;
  provider_invoice_id?: string;
  provider_txn_id?: string;
  created_at: string;
  completed_at?: string;
  redirect_url?: string;
}

export interface Question {
  id: string;
  question_type: string;
  text: string;
  options?: any;
  table?: any;
  answer_dict?: any;
  answer_list?: any;
}

export interface QuestionSet {
  id: string;
  name: string;
  questions: Question[];
}

export interface ListeningSection {
  id: string;
  name: string;
  mp3_file: string;
  question_set_ids: string[];
}

export interface Listening {
  id: string;
  title: string;
  sections: ListeningSection[];
}

export interface ReadingPassage {
  id: string;
  name: string;
  question_set_ids: string[];
}

export interface Reading {
  id: string;
  title: string;
  passages: ReadingPassage[];
}

export interface TaskOne {
  id: string;
  topic: string;
  image_title?: string;
  image?: string;
}

export interface TaskTwo {
  id: string;
  topic: string;
}

export interface Writing {
  id: string;
  task_one: TaskOne;
  task_two: TaskTwo;
}

export interface TestDetail {
  id: string;
  title: string;
  price: string;
  listening?: Listening;
  reading?: Reading;
  writing?: Writing;
  created_at: string;
  updated_at: string;
}

export interface SpeakingRequest {
  id: string;
  status: string;
  requested_at: string;
  scheduled_at?: string;
}

export interface StudentDashboard {
  profile: StudentProfile;
  sections: {
    [key: string]: any;
  };
}

export interface TeacherDashboard {
  profile: TeacherProfile;
  sections: {
    [key: string]: any;
  };
}
