"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Edit2,
  FileDown,
  Sparkles,
  Award,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  name: string;
  code: string | null;
  credits: number;
  instructor: string | null;
  room: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  color: string | null;
  targetGrade: string | null;
  totalLessons: number;
  completedLessons: number;
  status: string;
}

interface StudyLog {
  id: string;
  title: string;
  content: string;
  hoursSpent: number;
  date: string;
  homework: string | null;
  homeworkDue: string | null;
  isHomeworkDone: boolean;
  courseId: string | null;
  course?: { name: string; code: string | null; color: string | null } | null;
}

interface StudyMaterial {
  id: string;
  title: string;
  category: string;
  urlOrPath: string | null;
  summary: string | null;
  isImportant: boolean;
  courseId: string | null;
  course?: { name: string; code: string | null } | null;
}

const DAY_NAMES: { [key: number]: string } = {
  2: "Thứ Hai",
  3: "Thứ Ba",
  4: "Thứ Tư",
  5: "Thứ Năm",
  6: "Thứ Sáu",
  7: "Thứ Bảy",
  8: "Chủ Nhật",
};

export default function StudyHubPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "journal" | "materials">("courses");

  const [courses, setCourses] = useState<Course[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  // Form Course state
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    credits: 3,
    instructor: "",
    room: "",
    dayOfWeek: 2,
    startTime: "07:30",
    endTime: "10:00",
    targetGrade: "A",
    totalLessons: 15,
  });

  // Form Log state
  const [logForm, setLogForm] = useState({
    courseId: "",
    title: "",
    content: "",
    hoursSpent: 1.5,
    homework: "",
    homeworkDue: "",
  });

  // Form Material state
  const [matForm, setMatForm] = useState({
    courseId: "",
    title: "",
    category: "SLIDE",
    urlOrPath: "",
    summary: "",
    isImportant: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resC, resL, resM] = await Promise.all([
        fetch("/api/study/courses"),
        fetch("/api/study/logs"),
        fetch("/api/study/materials"),
      ]);

      if (resC.ok) setCourses(await resC.json());
      if (resL.ok) setLogs(await resL.json());
      if (resM.ok) setMaterials(await resM.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/study/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });
      if (res.ok) {
        setShowCourseModal(false);
        setCourseForm({
          name: "",
          code: "",
          credits: 3,
          instructor: "",
          room: "",
          dayOfWeek: 2,
          startTime: "07:30",
          endTime: "10:00",
          targetGrade: "A",
          totalLessons: 15,
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/study/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logForm),
      });
      if (res.ok) {
        setShowLogModal(false);
        setLogForm({
          courseId: "",
          title: "",
          content: "",
          hoursSpent: 1.5,
          homework: "",
          homeworkDue: "",
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/study/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matForm),
      });
      if (res.ok) {
        setShowMaterialModal(false);
        setMatForm({
          courseId: "",
          title: "",
          category: "SLIDE",
          urlOrPath: "",
          summary: "",
          isImportant: false,
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleHomework = async (logId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/study/logs/${logId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHomeworkDone: !currentStatus }),
      });
      setLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, isHomeworkDone: !currentStatus } : l))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa môn học này?")) return;
    try {
      const res = await fetch(`/api/study/courses/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    try {
      const res = await fetch(`/api/study/materials/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Nhật ký học tập & Học phần</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            Quản lý {courses.length} môn học ({totalCredits} tín chỉ) · Theo dõi tiến độ & tài liệu ôn thi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTab === "courses" && (
            <Button onClick={() => setShowCourseModal(true)} size="sm" className="gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              Thêm môn học
            </Button>
          )}
          {activeTab === "journal" && (
            <Button onClick={() => setShowLogModal(true)} size="sm" className="gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              Ghi bài học mới
            </Button>
          )}
          {activeTab === "materials" && (
            <Button onClick={() => setShowMaterialModal(true)} size="sm" className="gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              Thêm tài liệu
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-purple-500/[0.04] dark:bg-white/[0.03] border border-border/70 max-w-md">
        <button
          onClick={() => setActiveTab("courses")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "courses"
              ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Môn học & Tiến độ
        </button>
        <button
          onClick={() => setActiveTab("journal")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "journal"
              ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Nhật ký buổi học ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab("materials")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === "materials"
              ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Tài liệu ôn tập ({materials.length})
        </button>
      </div>

      {/* ----------------- TAB 1: MÔN HỌC & TIẾN ĐỘ ----------------- */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Chưa có môn học nào được thiết lập cho học kỳ này.
              </p>
              <Button onClick={() => setShowCourseModal(true)} size="sm">
                Thêm môn học đầu tiên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const progress = Math.min(
                  100,
                  Math.round((course.completedLessons / (course.totalLessons || 15)) * 100)
                );

                return (
                  <div
                    key={course.id}
                    className="glass-card p-5 space-y-4 relative group flex flex-col justify-between"
                  >
                    <div>
                      {/* Course Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-foreground">
                              {course.name}
                            </span>
                            {course.code && (
                              <Badge variant="outline" className="text-xs font-mono">
                                {course.code}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                            <span>{course.credits} tín chỉ</span>
                            {course.instructor && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-purple-400" />
                                {course.instructor}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {course.targetGrade && (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-mono">
                              Mục tiêu: {course.targetGrade}
                            </Badge>
                          )}
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Xóa môn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Schedule info */}
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-500/[0.04] dark:bg-white/[0.03] border border-border/70 my-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-[11px]">Thời gian học:</span>
                          <div className="font-medium font-mono text-purple-600 dark:text-purple-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {DAY_NAMES[course.dayOfWeek]} · {course.startTime} - {course.endTime}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-[11px]">Phòng học:</span>
                          <div className="font-medium text-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                            <span>{course.room || "Chưa cập nhật"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress tracking */}
                    <div className="space-y-1.5 pt-2 border-t border-border/70">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted-foreground">
                          Tiến độ chương trình: {course.completedLessons}/{course.totalLessons || 15} buổi
                        </span>
                        <span className="font-semibold text-purple-600 dark:text-purple-300">{progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-purple-500/10 dark:bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-fuchsia-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 2: NHẬT KÝ BUỔI HỌC ----------------- */}
      {activeTab === "journal" && (
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Chưa có nhật ký buổi học nào được ghi lại.</p>
              <Button onClick={() => setShowLogModal(true)} size="sm">
                Ghi chép buổi học đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const dateFormatted = new Date(log.date).toLocaleDateString("vi-VN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                return (
                  <div key={log.id} className="glass-card p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/70">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-foreground">{log.title}</h3>
                          {log.course && (
                            <Badge variant="outline" className="text-xs font-normal">
                              {log.course.name}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {dateFormatted} · Thời gian học: {log.hoursSpent}h
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {log.content}
                    </p>

                    {/* Homework section if available */}
                    {log.homework && (
                      <div className="p-3 rounded-xl bg-purple-500/[0.04] dark:bg-white/[0.03] border border-border/70 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={() => handleToggleHomework(log.id, log.isHomeworkDone)}
                            className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                              log.isHomeworkDone
                                ? "bg-emerald-500 text-white"
                                : "border border-purple-500/40 dark:border-white/30"
                            }`}
                          >
                            {log.isHomeworkDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <div className="min-w-0">
                            <span className="text-[11px] text-muted-foreground block">
                              Bài tập về nhà:
                            </span>
                            <span
                              className={`truncate block ${
                                log.isHomeworkDone ? "line-through text-muted-foreground" : "font-medium"
                              }`}
                            >
                              {log.homework}
                            </span>
                          </div>
                        </div>

                        {log.homeworkDue && (
                          <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                            Hạn: {new Date(log.homeworkDue).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 3: TÀI LIỆU ÔN TẬP ----------------- */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          {materials.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Chưa có tài liệu ôn tập nào được lưu trữ.</p>
              <Button onClick={() => setShowMaterialModal(true)} size="sm">
                Thêm tài liệu đầu tiên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="glass-card p-5 space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-300">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{mat.title}</h4>
                          {mat.course && (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {mat.course.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {mat.category}
                        </Badge>
                        <button
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {mat.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {mat.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/70 flex items-center justify-between">
                    {mat.urlOrPath ? (
                      <a
                        href={mat.urlOrPath}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-300 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở tài liệu / Slide</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Tài liệu nội bộ</span>
                    )}

                    {mat.isImportant && (
                      <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3" />
                        Ôn trọng tâm
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- MODAL THÊM MÔN HỌC ----------------- */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-overlay rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h2 className="text-base font-semibold text-foreground">Thêm môn học mới</h2>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tên môn học</label>
                <Input
                  required
                  placeholder="VD: Lập trình Web nâng cao"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Mã môn (nếu có)</label>
                  <Input
                    placeholder="VD: CS302"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Số tín chỉ</label>
                  <Input
                    type="number"
                    value={courseForm.credits}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, credits: parseInt(e.target.value || "3", 10) })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Giảng viên</label>
                  <Input
                    placeholder="VD: TS. Nguyễn Văn Nam"
                    value={courseForm.instructor}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Phòng học / Giảng đường</label>
                  <Input
                    placeholder="VD: A1-402"
                    value={courseForm.room}
                    onChange={(e) => setCourseForm({ ...courseForm, room: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Thứ trong tuần</label>
                  <select
                    value={courseForm.dayOfWeek}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, dayOfWeek: parseInt(e.target.value, 10) })
                    }
                    className="w-full h-9 text-xs px-2 rounded-md border border-purple-500/20 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] text-foreground"
                  >
                    <option value={2} className="bg-card">Thứ 2</option>
                    <option value={3} className="bg-card">Thứ 3</option>
                    <option value={4} className="bg-card">Thứ 4</option>
                    <option value={5} className="bg-card">Thứ 5</option>
                    <option value={6} className="bg-card">Thứ 6</option>
                    <option value={7} className="bg-card">Thứ 7</option>
                    <option value={8} className="bg-card">Chủ Nhật</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Giờ bắt đầu</label>
                  <Input
                    placeholder="07:30"
                    value={courseForm.startTime}
                    onChange={(e) => setCourseForm({ ...courseForm, startTime: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Giờ kết thúc</label>
                  <Input
                    placeholder="10:00"
                    value={courseForm.endTime}
                    onChange={(e) => setCourseForm({ ...courseForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Mục tiêu điểm số</label>
                  <Input
                    placeholder="VD: A+, 4.0"
                    value={courseForm.targetGrade}
                    onChange={(e) => setCourseForm({ ...courseForm, targetGrade: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Tổng số buổi</label>
                  <Input
                    type="number"
                    value={courseForm.totalLessons}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, totalLessons: parseInt(e.target.value || "15", 10) })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border/70">
                <Button type="button" variant="outline" onClick={() => setShowCourseModal(false)} className="flex-1">
                  Hủy
                </Button>
                <Button type="submit" className="flex-1">
                  Lưu môn học
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL GHI NHẬT KÝ BUỔI HỌC ----------------- */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-overlay rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h2 className="text-base font-semibold text-foreground">Ghi chép buổi học</h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Môn học liên quan</label>
                <select
                  value={logForm.courseId}
                  onChange={(e) => setLogForm({ ...logForm, courseId: e.target.value })}
                  className="w-full h-9 text-xs px-2.5 rounded-md border border-purple-500/20 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] text-foreground"
                >
                  <option value="" className="bg-card">-- Tự học / Không theo môn --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-card">
                      {c.name} ({c.code || "Môn học"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tiêu đề buổi học</label>
                <Input
                  required
                  placeholder="VD: Bài giảng Chương 3: Tối ưu hóa truy vấn SQL"
                  value={logForm.title}
                  onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Nội dung kiến thức cốt lõi</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ghi lại các định lý, công thức, bài tập hoặc điều cần nhớ..."
                  value={logForm.content}
                  onChange={(e) => setLogForm({ ...logForm, content: e.target.value })}
                  className="w-full p-2.5 rounded-md border border-purple-500/20 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] text-xs text-foreground placeholder:text-muted-foreground outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Thời gian học (tiếng)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={logForm.hoursSpent}
                    onChange={(e) => setLogForm({ ...logForm, hoursSpent: parseFloat(e.target.value || "1") })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Hạn nộp bài tập</label>
                  <Input
                    type="date"
                    value={logForm.homeworkDue}
                    onChange={(e) => setLogForm({ ...logForm, homeworkDue: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Bài tập về nhà (nếu có)</label>
                <Input
                  placeholder="VD: Làm bài tập 1, 2 trang 45"
                  value={logForm.homework}
                  onChange={(e) => setLogForm({ ...logForm, homework: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-border/70">
                <Button type="button" variant="outline" onClick={() => setShowLogModal(false)} className="flex-1">
                  Hủy
                </Button>
                <Button type="submit" className="flex-1">
                  Lưu nhật ký
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL THÊM TÀI LIỆU ÔN TẬP ----------------- */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-overlay rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h2 className="text-base font-semibold text-foreground">Thêm tài liệu ôn tập</h2>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Môn học</label>
                <select
                  value={matForm.courseId}
                  onChange={(e) => setMatForm({ ...matForm, courseId: e.target.value })}
                  className="w-full h-9 text-xs px-2.5 rounded-md border border-purple-500/20 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] text-foreground"
                >
                  <option value="" className="bg-card">-- Tài liệu chung / Kỹ năng --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-card">
                      {c.name} ({c.code || "Môn học"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tên tài liệu / Giáo trình</label>
                <Input
                  required
                  placeholder="VD: Bộ đề thi kết thúc học phần có giải chi tiết"
                  value={matForm.title}
                  onChange={(e) => setMatForm({ ...matForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Phân loại</label>
                  <select
                    value={matForm.category}
                    onChange={(e) => setMatForm({ ...matForm, category: e.target.value })}
                    className="w-full h-9 text-xs px-2.5 rounded-md border border-purple-500/20 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] text-foreground"
                  >
                    <option value="SLIDE" className="bg-card">Slide bài giảng</option>
                    <option value="EXAM_PREP" className="bg-card">Đề thi mẫu & Ôn tập</option>
                    <option value="BOOK" className="bg-card">Giáo trình / Ebook</option>
                    <option value="SUMMARY" className="bg-card">Tóm tắt công thức</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Link Drive / Web</label>
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={matForm.urlOrPath}
                    onChange={(e) => setMatForm({ ...matForm, urlOrPath: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Tóm tắt kiến thức trọng tâm</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú nhanh các chương quan trọng trong tài liệu này..."
                  value={matForm.summary}
                  onChange={(e) => setMatForm({ ...matForm, summary: e.target.value })}
                  className="w-full p-2.5 rounded-md border border-purple-500/20 dark:border-white/15 bg-white/70 dark:bg-white/[0.04] text-xs text-foreground placeholder:text-muted-foreground outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground pt-1">
                <input
                  type="checkbox"
                  checked={matForm.isImportant}
                  onChange={(e) => setMatForm({ ...matForm, isImportant: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 accent-purple-600"
                />
                <span>Đánh dấu tài liệu trọng tâm ôn thi cuối kỳ</span>
              </label>

              <div className="flex gap-2 pt-3 border-t border-border/70">
                <Button type="button" variant="outline" onClick={() => setShowMaterialModal(false)} className="flex-1">
                  Hủy
                </Button>
                <Button type="submit" className="flex-1">
                  Lưu tài liệu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
