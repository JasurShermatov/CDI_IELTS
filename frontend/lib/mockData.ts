import { faker } from '@faker-js/faker';

const withSeed = <T,>(seed: number, fn: () => T): T => {
  faker.seed(seed);
  return fn();
};

const money = (min: number, max: number): string =>
  String(faker.number.int({ min, max }));

const isoDate = (days: number): string =>
  faker.date.recent({ days }).toISOString();

export const getMockStudentDashboard = () =>
  withSeed(101, () => {
    const userId = faker.string.uuid();
    const profileId = faker.string.uuid();
    const fullname = faker.person.fullName();
    const phone = faker.phone.number('+9989########');
    const balance = money(150000, 3200000);

    const allTests = Array.from({ length: 6 }).map(() => ({
      id: faker.string.uuid(),
      title: `IELTS Practice ${faker.number.int({ min: 1, max: 20 })}`,
      price: money(50000, 220000),
      purchased: faker.datatype.boolean(),
    }));

    const myTests = Array.from({ length: 3 }).map(() => ({
      id: faker.string.uuid(),
      status: faker.helpers.arrayElement(['not_started', 'in_progress', 'completed']),
      started_at: isoDate(20),
      completed_at: faker.datatype.boolean() ? isoDate(10) : null,
      price_paid: money(70000, 180000),
      test: {
        id: faker.string.uuid(),
        title: `IELTS Set ${faker.number.int({ min: 1, max: 10 })}`,
        price: money(70000, 180000),
        purchased: true,
      },
    }));

    const results = Array.from({ length: 4 }).map(() => ({
      user_test_id: faker.string.uuid(),
      test_id: faker.string.uuid(),
      test_title: `IELTS Mock ${faker.number.int({ min: 1, max: 15 })}`,
      listening_score: faker.number.float({ min: 5, max: 9, precision: 0.5 }),
      reading_score: faker.number.float({ min: 5, max: 9, precision: 0.5 }),
      writing_score: faker.number.float({ min: 5, max: 9, precision: 0.5 }),
      overall_score: faker.number.float({ min: 5, max: 9, precision: 0.5 }),
      created_at: isoDate(30),
    }));

    return {
      profile: {
        id: profileId,
        user: {
          id: userId,
          fullname,
          telegram_username: faker.helpers.arrayElement([null, faker.internet.userName()]) || undefined,
          phone_number: phone,
          role: 'student',
          last_activity: isoDate(7),
        },
        balance,
        type: faker.helpers.arrayElement(['online', 'offline']),
        is_approved: faker.datatype.boolean(),
        is_offline: faker.datatype.boolean(),
        created_at: isoDate(60),
        updated_at: isoDate(5),
      },
      sections: {
        all_tests: allTests,
        my_tests: myTests,
        results,
      },
    };
  });

export const getMockTeacherDashboard = () =>
  withSeed(202, () => {
    const userId = faker.string.uuid();
    const profileId = faker.string.uuid();

    const makeItems = (count: number) =>
      Array.from({ length: count }).map(() => ({
        id: faker.string.uuid(),
        user_test_id: faker.string.uuid(),
        student_fullname: faker.person.fullName(),
        test_title: `IELTS Writing ${faker.number.int({ min: 1, max: 10 })}`,
        task: faker.helpers.arrayElement(['task_1', 'task_2']),
        status: faker.helpers.arrayElement(['requested', 'checking', 'checked']),
        score: faker.datatype.boolean()
          ? faker.number.float({ min: 5, max: 9, precision: 0.5 })
          : null,
        submitted_at: isoDate(20),
        checked_at: faker.datatype.boolean() ? isoDate(5) : null,
      }));

    return {
      profile: {
        id: profileId,
        user: {
          id: userId,
          fullname: faker.person.fullName(),
          telegram_username: faker.internet.userName(),
          phone_number: faker.phone.number('+9989########'),
          role: 'teacher',
          last_activity: isoDate(7),
        },
        created_at: isoDate(200),
        updated_at: isoDate(10),
      },
      sections: {
        all_writing: { count: 8, items: makeItems(3) },
        my_checking: { count: 3, items: makeItems(2) },
        my_checked: { count: 12, items: makeItems(3) },
      },
    };
  });

export const getMockTests = () =>
  withSeed(303, () =>
    Array.from({ length: 8 }).map(() => ({
      id: faker.string.uuid(),
      title: `IELTS Practice Test ${faker.number.int({ min: 1, max: 30 })}`,
      price: money(50000, 220000),
      created_at: isoDate(90),
      purchased: faker.datatype.boolean(),
    }))
  );

export const getMockMyTests = () =>
  withSeed(404, () =>
    Array.from({ length: 5 }).map(() => ({
      id: faker.string.uuid(),
      status: faker.helpers.arrayElement(['not_started', 'in_progress', 'completed']),
      price_paid: money(70000, 180000),
      started_at: isoDate(40),
      completed_at: faker.datatype.boolean() ? isoDate(10) : null,
      created_at: isoDate(60),
      test: {
        id: faker.string.uuid(),
        title: `IELTS Set ${faker.number.int({ min: 1, max: 15 })}`,
        price: money(70000, 180000),
        purchased: true,
      },
    }))
  );

export const getMockResults = () =>
  withSeed(505, () =>
    Array.from({ length: 4 }).map(() => ({
      id: faker.string.uuid(),
      user_test: {
        id: faker.string.uuid(),
        status: 'completed',
        price_paid: money(80000, 150000),
        created_at: isoDate(120),
        test: {
          id: faker.string.uuid(),
          title: `IELTS Mock ${faker.number.int({ min: 1, max: 12 })}`,
          price: money(80000, 150000),
        },
      },
      listening_score: faker.number.float({ min: 5, max: 9, precision: 0.5 }),
      reading_score: faker.number.float({ min: 5, max: 9, precision: 0.5 }),
      writing_score: faker.number.float({ min: 5, max: 9, precision: 0.5 }),
      overall_score: faker.number.float({ min: 5, max: 9, precision: 0.5 }),
      feedback: faker.helpers.arrayElement([
        'Great progress! Focus on coherence in Task 2.',
        'Strong vocabulary range. Improve grammar accuracy.',
        'Good structure. Work on time management.',
      ]),
      created_at: isoDate(40),
    }))
  );

export const getMockSpeakingRequests = () =>
  withSeed(606, () =>
    Array.from({ length: 3 }).map(() => ({
      id: faker.string.uuid(),
      status: faker.helpers.arrayElement(['created', 'scheduled', 'completed']),
      requested_at: isoDate(25),
      scheduled_at: faker.datatype.boolean() ? isoDate(10) : null,
    }))
  );

export const getMockTeacherSubmissions = () =>
  withSeed(707, () => {
    const make = (status: string, count: number) =>
      Array.from({ length: count }).map(() => ({
        id: faker.string.uuid(),
        user_test_id: faker.string.uuid(),
        student_fullname: faker.person.fullName(),
        test_title: `IELTS Writing ${faker.number.int({ min: 1, max: 10 })}`,
        task: faker.helpers.arrayElement(['task_1', 'task_2']),
        status,
        score: status === 'checked'
          ? faker.number.float({ min: 5, max: 9, precision: 0.5 })
          : undefined,
        submitted_at: isoDate(20),
        checked_at: status === 'checked' ? isoDate(5) : undefined,
      }));

    return {
      all: make('pending', 4),
      checking: make('claimed', 2),
      checked: make('checked', 3),
    };
  });

export const getMockTestDetail = (id?: string) =>
  withSeed(808, () => ({
    id: id || faker.string.uuid(),
    title: `IELTS Full Test ${faker.number.int({ min: 1, max: 12 })}`,
    price: money(90000, 180000),
    created_at: isoDate(200),
    updated_at: isoDate(10),
    listening: {
      id: faker.string.uuid(),
      title: 'Listening Module',
      sections: Array.from({ length: 4 }).map((_, idx) => ({
        id: faker.string.uuid(),
        name: `Section ${idx + 1}`,
        mp3_file: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav',
        question_set_ids: [faker.string.uuid(), faker.string.uuid()],
      })),
    },
    reading: {
      id: faker.string.uuid(),
      title: 'Reading Module',
      passages: Array.from({ length: 3 }).map((_, idx) => ({
        id: faker.string.uuid(),
        name: `Passage ${idx + 1}`,
        question_set_ids: [faker.string.uuid(), faker.string.uuid()],
      })),
    },
    writing: {
      id: faker.string.uuid(),
      task_one: {
        id: faker.string.uuid(),
        topic: 'The chart below shows the percentage of households with internet access in three countries between 2000 and 2020.',
        image_title: 'Internet Access Trend',
        image: 'https://placehold.co/800x500/png?text=Task+1+Chart',
      },
      task_two: {
        id: faker.string.uuid(),
        topic: 'Some people believe that students should be allowed to choose their own teachers. Discuss both views and give your opinion.',
      },
    },
  }));

