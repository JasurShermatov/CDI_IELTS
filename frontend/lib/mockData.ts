import { faker } from '@faker-js/faker';
import type {
  StudentDashboard,
  TeacherDashboard,
  Test,
  UserTest,
  TestResult,
  SpeakingRequest,
  TestDetail,
} from '@/lib/types';

faker.seed(42);

const money = (min: number, max: number): string =>
  String(faker.number.int({ min, max }));

const recentIso = (days: number): string =>
  faker.date.recent({ days }).toISOString();

/* ─────────────────────────────────────────
   STUDENT DASHBOARD
───────────────────────────────────────── */
export function getMockStudentDashboard(): StudentDashboard {
  faker.seed(101);
  return {
    profile: {
      id: faker.string.uuid(),
      user: {
        id: faker.string.uuid(),
        fullname: faker.person.fullName(),
        telegram_username: faker.internet.username(),
        phone_number: '+998901234567',
        role: 'student',
        last_activity: recentIso(3),
      },
      balance: money(200000, 3500000),
      type: 'online',
      is_approved: true,
      is_offline: false,
      created_at: recentIso(90),
      updated_at: recentIso(2),
    },
    sections: {},
  };
}

/* ─────────────────────────────────────────
   TEACHER DASHBOARD
───────────────────────────────────────── */
export function getMockTeacherDashboard(): TeacherDashboard {
  faker.seed(202);
  return {
    profile: {
      id: faker.string.uuid(),
      user: {
        id: faker.string.uuid(),
        fullname: faker.person.fullName(),
        telegram_username: faker.internet.username(),
        phone_number: '+998901234568',
        role: 'teacher',
        last_activity: recentIso(1),
      },
      created_at: recentIso(200),
      updated_at: recentIso(5),
    },
    sections: {
      all_writing: {
        count: 8,
        items: Array.from({ length: 4 }, () => ({
          id: faker.string.uuid(),
          user_test_id: faker.string.uuid(),
          student_fullname: faker.person.fullName(),
          test_title: `IELTS Writing ${faker.number.int({ min: 1, max: 10 })}`,
          task: faker.helpers.arrayElement(['task_1', 'task_2']),
          status: 'pending',
          submitted_at: recentIso(10),
          checked_at: null,
        })),
      },
      my_checking: {
        count: 3,
        items: Array.from({ length: 2 }, () => ({
          id: faker.string.uuid(),
          user_test_id: faker.string.uuid(),
          student_fullname: faker.person.fullName(),
          test_title: `IELTS Writing ${faker.number.int({ min: 1, max: 10 })}`,
          task: 'task_2',
          status: 'claimed',
          submitted_at: recentIso(5),
          checked_at: null,
        })),
      },
      my_checked: {
        count: 12,
        items: Array.from({ length: 3 }, () => ({
          id: faker.string.uuid(),
          user_test_id: faker.string.uuid(),
          student_fullname: faker.person.fullName(),
          test_title: `IELTS Writing ${faker.number.int({ min: 1, max: 10 })}`,
          task: 'task_1',
          status: 'checked',
          score: faker.number.float({ min: 5.0, max: 9.0, fractionDigits: 1 }),
          submitted_at: recentIso(20),
          checked_at: recentIso(5),
        })),
      },
    },
  };
}

/* ─────────────────────────────────────────
   ALL TESTS (browse)
───────────────────────────────────────── */
export function getMockTests(): Test[] {
  faker.seed(303);
  const titles = [
    'IELTS Academic – Full Mock 1',
    'IELTS Academic – Full Mock 2',
    'IELTS General Training Set A',
    'IELTS General Training Set B',
    'IELTS Academic – Full Mock 3',
    'IELTS Listening Focus Pack',
    'IELTS Reading Intensive Set',
    'IELTS Writing Band 7+ Pack',
  ];
  return titles.map((title, i) => ({
    id: faker.string.uuid(),
    title,
    price: money(50000, 220000),
    created_at: recentIso(90 - i * 5),
    purchased: i < 2,
  }));
}

/* ─────────────────────────────────────────
   MY TESTS (purchased)
───────────────────────────────────────── */
export function getMockMyTests(): UserTest[] {
  faker.seed(404);
  const statuses: UserTest['status'][] = ['completed', 'in_progress', 'not_started', 'in_progress', 'completed'];
  return statuses.map((status, i) => ({
    id: faker.string.uuid(),
    status,
    price_paid: money(70000, 180000),
    started_at: recentIso(40 - i),
    completed_at: status === 'completed' ? recentIso(10 - i) : undefined,
    created_at: recentIso(60 - i),
    test: {
      id: faker.string.uuid(),
      title: `IELTS Academic – Full Mock ${i + 1}`,
      price: money(70000, 180000),
      created_at: recentIso(90 - i * 5),
      purchased: true,
    },
  }));
}

/* ─────────────────────────────────────────
   RESULTS
───────────────────────────────────────── */
export function getMockResults(): TestResult[] {
  faker.seed(505);
  const feedbacks = [
    'Excellent coherence and cohesion. Work on lexical resource for Band 8+.',
    'Strong grammatical range. Focus on task achievement for Writing.',
    'Good progress! Reading skimming speed needs improvement.',
    'Solid listening score. Practice note-completion tasks more.',
  ];
  const completedStatus: UserTest['status'] = 'completed';
  return feedbacks.map((feedback, i) => ({
    id: faker.string.uuid(),
    user_test: {
      id: faker.string.uuid(),
      status: completedStatus,
      price_paid: money(80000, 150000),
      created_at: recentIso(120 - i * 10),
      test: {
        id: faker.string.uuid(),
        title: `IELTS Academic – Full Mock ${i + 1}`,
        price: money(80000, 150000),
        created_at: recentIso(130 - i * 10),
        purchased: true,
      },
    },
    listening_score: faker.number.float({ min: 5.5, max: 9.0, fractionDigits: 1 }),
    reading_score: faker.number.float({ min: 5.5, max: 9.0, fractionDigits: 1 }),
    writing_score: faker.number.float({ min: 5.0, max: 8.5, fractionDigits: 1 }),
    overall_score: faker.number.float({ min: 5.5, max: 9.0, fractionDigits: 1 }),
    feedback,
    created_at: recentIso(40 - i * 5),
  }));
}

/* ─────────────────────────────────────────
   SPEAKING REQUESTS
───────────────────────────────────────── */
export function getMockSpeakingRequests(): SpeakingRequest[] {
  faker.seed(606);
  const statuses: SpeakingRequest['status'][] = ['pending', 'connected', 'completed', 'cancelled', 'pending'];
  return statuses.map((status, i) => ({
    id: faker.string.uuid(),
    full_name: faker.person.fullName(),
    telegram_username: faker.internet.username(),
    phone_number: '+99890' + faker.string.numeric(7),
    payment_date: recentIso(10 + i),
    checklist: {
      recording_ready: true,
      internet_stable: true,
      quiet_environment: true,
      id_ready: true,
      punctuality: true,
    },
    status,
    fee_amount: '50000',
    currency: 'UZS',
    note: '',
    created_at: recentIso(20 - i),
    updated_at: recentIso(5 - i),
  }));
}

/* ─────────────────────────────────────────
   TEACHER SUBMISSIONS
───────────────────────────────────────── */
export function getMockTeacherSubmissions() {
  faker.seed(707);
  const mkItem = (status: string, score?: number) => ({
    id: faker.string.uuid(),
    user_test_id: faker.string.uuid(),
    student_fullname: faker.person.fullName(),
    test_title: `IELTS Writing ${faker.number.int({ min: 1, max: 10 })}`,
    task: faker.helpers.arrayElement(['task_1', 'task_2']) as string,
    status,
    score,
    submitted_at: recentIso(20),
    checked_at: score !== undefined ? recentIso(5) : undefined,
  });

  return {
    all: [
      mkItem('pending'), mkItem('pending'), mkItem('pending'), mkItem('pending'),
    ],
    checking: [mkItem('claimed'), mkItem('claimed')],
    checked: [
      mkItem('checked', 7.5),
      mkItem('checked', 8.0),
      mkItem('checked', 6.5),
    ],
  };
}

/* ─────────────────────────────────────────
   TEST DETAIL (full test page)
───────────────────────────────────────── */
export function getMockTestDetail(id?: string): TestDetail {
  faker.seed(808);
  return {
    id: id ?? faker.string.uuid(),
    title: 'IELTS Academic – Full Mock 1',
    price: money(90000, 180000),
    created_at: recentIso(200),
    updated_at: recentIso(10),
    listening: {
      id: faker.string.uuid(),
      title: 'Listening Module',
      sections: [
        { id: faker.string.uuid(), name: 'Section 1 – Conversation', mp3_file: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav', question_set_ids: [faker.string.uuid()] },
        { id: faker.string.uuid(), name: 'Section 2 – Monologue',    mp3_file: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav', question_set_ids: [faker.string.uuid()] },
        { id: faker.string.uuid(), name: 'Section 3 – Discussion',   mp3_file: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav', question_set_ids: [faker.string.uuid()] },
        { id: faker.string.uuid(), name: 'Section 4 – Lecture',      mp3_file: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav', question_set_ids: [faker.string.uuid()] },
      ],
    },
    reading: {
      id: faker.string.uuid(),
      title: 'Reading Module',
      passages: [
        { id: faker.string.uuid(), name: 'Passage 1 – The History of Salt', question_set_ids: [faker.string.uuid(), faker.string.uuid()] },
        { id: faker.string.uuid(), name: 'Passage 2 – Climate & Agriculture', question_set_ids: [faker.string.uuid(), faker.string.uuid()] },
        { id: faker.string.uuid(), name: 'Passage 3 – The Future of AI',     question_set_ids: [faker.string.uuid(), faker.string.uuid()] },
      ],
    },
    writing: {
      id: faker.string.uuid(),
      task_one: {
        id: faker.string.uuid(),
        topic: 'The bar chart below shows the percentage of households in three countries that owned various appliances in 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        image_title: 'Household Appliance Ownership 2011',
        image: 'https://placehold.co/800x480/e5e7eb/374151?text=Task+1+Bar+Chart',
      },
      task_two: {
        id: faker.string.uuid(),
        topic: 'In some countries, owning a home rather than renting one is very important to people. Why might this be the case? Do you think this is a positive or negative situation?',
      },
    },
  };
}
