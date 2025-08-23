"use client"

import { useState, useEffect } from "react"
import {
  ExternalLink,
  Github,
  Star,
  Grid3X3,
  List,
  Filter,
  Search,
  Calendar,
  Code2,
  Eye,
  SlidersHorizontal,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { PROJECTS } from "@/constants"

export function ProjectsWindow() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "featured" | "web" | "mobile">("all")
  const [isMobile, setIsMobile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const filteredProjects = PROJECTS.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "featured" && project.featured) ||
      (selectedFilter === "web" &&
        project.technologies.some((tech) => ["React", "Next.js", "Vue.js", "HTML/CSS"].includes(tech))) ||
      (selectedFilter === "mobile" &&
        project.technologies.some((tech) => ["React Native", "Expo", "Flutter"].includes(tech)))

    return matchesSearch && matchesFilter
  })

  const ProjectCard = ({
    project,
    isListView = false,
    isMobileView = false,
  }: {
    project: (typeof PROJECTS)[0]
    isListView?: boolean
    isMobileView?: boolean
  }) => {
    if (isMobileView) {
      return (
        <Card className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden active:scale-95 transition-transform duration-150">
          <div className="relative">
            <img
              src={project.image || "/placeholder.svg?height=180&width=320"}
              alt={project.title}
              className="w-full h-44 object-cover"
            />
            {project.featured && (
              <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-sm">
                <Star className="w-3 h-3" />
                <span>Featured</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4">
              <h3 className="text-white font-bold text-lg mb-1">{project.title}</h3>
            </div>
          </div>

          <div className="p-4">
            <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">{project.description}</p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.technologies.slice(0, 4).map((tech) => (
                <span key={tech} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-500 active:text-gray-700 transition-colors text-sm"
                >
                  <Github className="w-4 h-4 mr-1" />
                  Code
                </a>
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 active:text-blue-700 transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Demo
                </a>
              </div>
              <div className="text-xs text-gray-400">2024</div>
            </div>
          </div>
        </Card>
      )
    }

    if (isListView) {
      return (
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                  {project.featured && (
                    <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium border border-blue-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Source Code
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Live Demo
                  </a>
                </div>
              </div>

              <div className="ml-6 flex-shrink-0">
                <img
                  src={project.image || "/placeholder.svg?height=120&width=200"}
                  alt={project.title}
                  className="w-48 h-28 object-cover rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>
        </Card>
      )
    }

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
        <div className="relative overflow-hidden">
          <img
            src={project.image || "/placeholder.svg?height=200&width=400"}
            alt={project.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {project.featured && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>Featured</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-gray-600 mb-4 leading-relaxed text-sm">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 3).map((tech) => (
              <span key={tech} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium">
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md">
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                <Github className="w-4 h-4 mr-1" />
                Code
              </a>
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-500 hover:text-blue-700 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Demo
              </a>
            </div>
            <div className="text-xs text-gray-400 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              2024
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* iOS-style Header */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0 safe-area-top">
          <div className="px-4 py-3">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  {filteredProjects.length}
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-full transition-colors ${showFilters ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                  }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
              />
            </div>

            {/* Filter Pills - iOS Style */}
            {showFilters && (
              <div className="flex space-x-2 mb-4 animate-in slide-in-from-top duration-200">
                {[
                  { key: "all", label: "All" },
                  { key: "featured", label: "Featured" },
                  { key: "web", label: "Web" },
                  { key: "mobile", label: "Mobile" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedFilter(filter.key as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedFilter === filter.key
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 active:bg-gray-200"
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Code2 className="w-4 h-4" />
                <span>{filteredProjects.length} Projects</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{filteredProjects.filter((p) => p.featured).length} Featured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area with iOS-style scrolling */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full ios-scroll">
            <div className="px-4 pt-4 pb-32">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} isMobileView />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 shadow-sm flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
            <p className="text-gray-600">A showcase of my recent work and contributions</p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
              >
                <option value="all">All Projects</option>
                <option value="featured">Featured</option>
                <option value="web">Web Apps</option>
                <option value="mobile">Mobile Apps</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4" />
            <span>{filteredProjects.length} Projects</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{filteredProjects.filter((p) => p.featured).length} Featured</span>
          </div>
        </div>
      </div>

      {/* Content Area with iOS-style bouncy scrolling and proper padding */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full ios-scroll">
          <div className="px-6 pt-6 pb-32">
            <div className="max-w-7xl mx-auto">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} isListView />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
