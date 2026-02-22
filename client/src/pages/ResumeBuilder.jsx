import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  Briefcase,
  FileText,
  FolderIcon,
  GraduationCap,
  Sparkles,
  User,
  ChevronLeft,
  ChevronRight,
  Share2Icon,
  EyeIcon,
  EyeOff,
  DownloadIcon,
} from "lucide-react";

import { dummyResumeData } from "../assets/assets";
import PersonalInfoForm from "../components/PersonalInfoForm";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import ProfessionalSummaryForm from "../components/ProfessionalSummaryForm";
import ExperienceForm from "../components/ExperienceForm";
import EducationalForm from "../components/EducationalForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";

import { useSelector } from "react-redux";
import api from "../configs/api";
import toast from "react-hot-toast";

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
  });

  const loadExistingResume = async () => {
    try {
      const { data } = await api.get(`/api/resumes/get/${resumeId}`, {
        headers: { Authorization: token },
      });
      if (data.resume) {
        setResumeData({
          ...data.resume,
          professional_summary: data.resume.professional_summary || "",
          experience: data.resume.experience || [],
          education: data.resume.education || [],
          project: data.resume.project || [],
          skills: data.resume.skills || [],
        });
        document.title = data.resume.title;
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);


  const sections = [
    { id: "personals", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ];

  const activeSection = sections[activeSectionIndex];

  useEffect(() => {
    loadExistingResume();
  }, []);





  const changeResumeVisibility = async () => {
    const newPublicStatus = !resumeData.public;
    setResumeData({ ...resumeData, public: newPublicStatus });

    // Save the visibility change to backend
    try {
      await api.put("/api/resumes/update", {
        resumeId: resumeId,
        resumeData: { ...resumeData, public: newPublicStatus }
      }, {
        headers: { Authorization: token }
      });
      toast.success(newPublicStatus ? "Resume is now public" : "Resume is now private");
    } catch (error) {
      console.error("Failed to update visibility:", error);
      toast.error("Failed to update resume visibility");
      // Revert the change if it failed
      setResumeData({ ...resumeData, public: !newPublicStatus });
    }
  }

  const handleShare = () => {
    const frontendUrl = window.location.href.split("/app/")[0];
    const resumeUrl = frontendUrl + "/view/" + resumeId;

    if (navigator.share) {
      navigator.share({
        url: resumeUrl,
        text: "My Resume"
      })
    } else {
      alert("Share not supported on this browser.")
    }
  }

  const downloadResume = () => {
    window.print();
  }


  const saveResume = async () => {
    // 1. Prepare data
    let updateResumeData = structuredClone(resumeData);

    // Remove image from updatedResumeData if it's an object (File)
    if (typeof resumeData.personal_info.image === "object") {
      delete updateResumeData.personal_info.image;
    }

    const formData = new FormData();
    formData.append("resumeId", resumeId);
    formData.append("resumeData", JSON.stringify(updateResumeData));
    formData.append("removeBackground", removeBackground ? "yes" : "no");

    if (typeof resumeData.personal_info.image === "object") {
      formData.append("image", resumeData.personal_info.image);
    }

    // 2. Call API
    // Correctly destructure { data } from the Axios response
    const { data } = await api.put("/api/resumes/update", formData, {
      headers: {
        Authorization: token,
        "Content-Type": "multipart/form-data",
      },
    });

    // 3. Update State safely
    if (data.resume) {
      setResumeData({
        ...data.resume,
        personal_info: data.resume.personal_info || {},
        professional_summary: data.resume.professional_summary || "",
        experience: data.resume.experience || [],
        education: data.resume.education || [],
        project: data.resume.project || [],
        skills: data.resume.skills || [],
      });
      setRemoveBackground(false); // Reset toggle after successful save
    }

    return data; // Return data for toast.promise
  };


  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="flex items-center justify-between">
        <Link
          to="/app"
          className="inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all"
        >
          <ArrowLeftIcon className="size-4" /> Back to Dashboard
        </Link>


      </div>

      <div className="grid lg:grid-cols-12 gap-8 mt-4">
        {/* LEFT PANEL */}
        <div className="relative lg:col-span-5 rounded-lg">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1">

            {/* 🔵 FIXED PROGRESS BAR */}
            <div className="relative h-4 mb-6">
              {/* Background bar */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full"></div>

              {/* Filled bar */}
              <div
                className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-green-500 rounded-full transition-all duration-300"
                style={{
                  width: `${(activeSectionIndex / (sections.length - 1)) * 100}%`,
                }}
              ></div>
            </div>

            {/* Section Navigation */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <TemplateSelector
                  selectedTemplate={resumeData.template}
                  onChange={(template) =>
                    setResumeData((prev) => ({ ...prev, template }))
                  }
                />

                <ColorPicker
                  selectedColor={resumeData.accent_color}
                  onChange={(accent_color) =>
                    setResumeData((prev) => ({ ...prev, accent_color }))
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                {activeSectionIndex > 0 && (
                  <button
                    onClick={() =>
                      setActiveSectionIndex((prev) => Math.max(prev - 1, 0))
                    }
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </button>
                )}

                <button
                  onClick={() =>
                    setActiveSectionIndex((prev) =>
                      Math.min(prev + 1, sections.length - 1)
                    )
                  }
                  disabled={activeSectionIndex === sections.length - 1}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 ${activeSectionIndex === sections.length - 1 &&
                    "opacity-50 cursor-not-allowed"
                    }`}
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* FORM CONTENT */}
            <div className="space-y-6">
              {activeSection.id === "personals" && (
                <PersonalInfoForm
                  data={resumeData.personal_info}
                  onChange={(data) =>
                    setResumeData((prev) => ({ ...prev, personal_info: data }))
                  }
                  removeBackground={removeBackground}
                  setRemoveBackground={setRemoveBackground}
                />
              )}

              {activeSection.id === "summary" && (
                <ProfessionalSummaryForm
                  data={resumeData.professional_summary}
                  resumeData={resumeData}
                  onChange={(data) =>
                    setResumeData((prev) => ({
                      ...prev,
                      professional_summary: data,
                    }))
                  }
                />
              )}

              {activeSection.id === "experience" && (
                <ExperienceForm
                  data={resumeData.experience}
                  onChange={(data) =>
                    setResumeData((prev) => ({
                      ...prev,
                      experience: data,
                    }))
                  }
                />
              )}

              {activeSection.id === "education" && (
                <EducationalForm
                  data={resumeData.education}
                  onChange={(data) =>
                    setResumeData((prev) => ({ ...prev, education: data }))
                  }
                />
              )}

              {activeSection.id === "projects" && (
                <ProjectForm
                  data={resumeData.project}
                  onChange={(data) =>
                    setResumeData((prev) => ({ ...prev, project: data }))
                  }
                />
              )}

              {activeSection.id === "skills" && (
                <SkillsForm
                  data={resumeData.skills}
                  onChange={(data) =>
                    setResumeData((prev) => ({ ...prev, skills: data }))
                  }
                />
              )}
            </div>

            <button
              onClick={() => {
                toast.promise(saveResume(), {
                  loading: "Saving Resume...",
                  success: (data) => data.message || "Resume Saved Successfully",
                  error: (err) => err?.response?.data?.message || err.message || "Failed to Save Resume",
                });
              }}
              className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 px-6 py-2 mt-6 rounded-md ring-1 ring-green-300 hover:ring-green-400 w-full font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-7 max-lg:mt-6">
          <div className="relative w-full">
            <div className="absolute bottom-3 left-0 right-0 flex items-center
            justify-center gap-2" >
              {resumeData.public && (
                <button onClick={handleShare} className="flex items-center p-2 px-4
                gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200
                text-blue-600 rounded-lg ring-blue-300 hover:ring
                transition-colors">
                  <Share2Icon className="size-4" />
                </button>
              )}
              <button onClick={changeResumeVisibility} className="flex items-center p-2 px-4 gap-2 text-xs
              bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600
              ring-purple-300 rounded-lg hover:ring transition-colors">
                {resumeData.public ? <EyeIcon className="size-4" /> :
                  <EyeOff className="size-4" />}
                {resumeData.public ? "Public" : "Private"}
              </button>
              <button onClick={downloadResume} className="flex items-center px-6 py-2 gap-2 text-xs
              bg-gradient-to-br from-green-100 to-green-200 text-green-600
              ring-green-300  hover:ring transition-colors">
                <DownloadIcon className="size-4" />Download
              </button>
            </div>
          </div>
          <ResumePreview
            data={resumeData}
            template={resumeData.template}
            accentColor={resumeData.accent_color}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
