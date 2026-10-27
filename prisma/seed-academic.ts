import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("Lỗi: Vui lòng cấu hình DEFAULT_ADMIN_EMAIL trong .env");
    return;
  }
  const user = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!user) {
    console.error("User not found!");
    return;
  }

  // 1. Tạo các môn học tiêu biểu kỳ này
  const coursesData = [
    {
      code: "CS302",
      name: "Lập trình Web & Ứng dụng phân tán",
      credits: 3,
      instructor: "TS. Nguyễn Văn Nam",
      room: "A1-402",
      dayOfWeek: 2, // Thứ Hai
      startTime: "07:30",
      endTime: "10:00",
      color: "#8b5cf6",
      targetGrade: "A+",
      totalLessons: 15,
      completedLessons: 9,
    },
    {
      code: "CS304",
      name: "Cơ sở dữ liệu nâng cao & Tối ưu hóa",
      credits: 3,
      instructor: "ThS. Trần Thị Mai",
      room: "B2-201",
      dayOfWeek: 3, // Thứ Ba
      startTime: "13:00",
      endTime: "15:30",
      color: "#06b6d4",
      targetGrade: "A",
      totalLessons: 15,
      completedLessons: 8,
    },
    {
      code: "ECO201",
      name: "Kinh tế lượng ứng dụng & Phân tích số liệu",
      credits: 3,
      instructor: "PGS. Lê Quang Huy",
      room: "D1-105",
      dayOfWeek: 5, // Thứ Năm
      startTime: "09:15",
      endTime: "11:45",
      color: "#10b981",
      targetGrade: "A",
      totalLessons: 15,
      completedLessons: 7,
    },
    {
      code: "AI401",
      name: "Trí tuệ nhân tạo & Mô hình ngôn ngữ lớn",
      credits: 4,
      instructor: "TS. Phạm Thanh Sơn",
      room: "Lab 3 - Nhà C",
      dayOfWeek: 6, // Thứ Sáu
      startTime: "07:30",
      endTime: "11:00",
      color: "#ec4899",
      targetGrade: "A+",
      totalLessons: 15,
      completedLessons: 10,
    },
  ];

  for (const c of coursesData) {
    const existing = await prisma.course.findFirst({
      where: { userId: user.id, name: c.name },
    });

    let courseId = existing?.id;
    if (!existing) {
      const created = await prisma.course.create({
        data: {
          userId: user.id,
          ...c,
        },
      });
      courseId = created.id;
    }

    if (courseId) {
      // Tạo nhật ký mẫu
      const existingLogs = await prisma.studyLog.count({ where: { courseId } });
      if (existingLogs === 0) {
        await prisma.studyLog.createMany({
          data: [
            {
              userId: user.id,
              courseId,
              title: `Buổi học kiến thức trọng tâm: ${c.name}`,
              content: `Hoàn thành bài giảng và thực hành lab trên lớp. Cần đọc thêm tài liệu chương tiếp theo và hoàn thiện bài tập code.`,
              hoursSpent: 2.5,
              date: new Date(),
              homework: "Làm bài tập trắc nghiệm & nộp mã nguồn qua LMS",
              homeworkDue: new Date(Date.now() + 3 * 86400000),
              isHomeworkDone: false,
            },
          ],
        });
      }

      // Tạo tài liệu ôn tập mẫu
      const existingMats = await prisma.studyMaterial.count({ where: { courseId } });
      if (existingMats === 0) {
        await prisma.studyMaterial.createMany({
          data: [
            {
              userId: user.id,
              courseId,
              title: `Slide bài giảng & Đề cương ôn thi ${c.code}`,
              category: "SLIDE",
              urlOrPath: "https://drive.google.com/drive/folders/sample",
              summary: "Tổng hợp các định lý, công thức và code mẫu ôn thi cuối kỳ.",
              isImportant: true,
            },
            {
              userId: user.id,
              courseId,
              title: `Bộ đề thi mẫu các năm trước ${c.code}`,
              category: "EXAM_PREP",
              summary: "3 đề thi giữa kỳ và 2 đề thi kết thúc học phần có đáp án chi tiết.",
              isImportant: true,
            },
          ],
        });
      }
    }
  }

  console.log("✅ Khởi tạo dữ liệu học tập thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
