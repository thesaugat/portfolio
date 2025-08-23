"use client"

import { Download, Calendar, MapPin, Mail, Phone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EXPERIENCE, EDUCATION, ACHIEVEMENTS } from "@/constants"

export function ResumeWindow() {
  return (
    <div className="p-6 h-full overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Saugat Timilsina</h1>
          <p className="text-xl text-gray-600 mb-4">Full Stack Developer & AI Engineer</p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              saugat@example.com
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              +977 98XXXXXXXX
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Kathmandu, Nepal
            </div>
          </div>

          <Button className="mt-4">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Professional Summary */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Passionate Full Stack Developer with 5+ years of experience building scalable web applications and
            AI-powered solutions. Expertise in React, Next.js, Node.js, and modern development practices. Proven track
            record of delivering high-quality software solutions that drive business growth and enhance user
            experiences. Strong background in machine learning integration and cloud technologies.
          </p>
        </section>

        {/* Experience */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
            Professional Experience
          </h2>
          <div className="space-y-6">
            {EXPERIENCE.map((job, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {job.period}
                  </div>
                </div>
                <div className="flex items-center text-gray-600 mb-3">
                  <span className="font-medium">{job.company}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {job.description.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">Education</h2>
          <div className="space-y-4">
            {EDUCATION.map((edu, index) => (
              <div key={index} className="border-l-4 border-green-200 pl-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{edu.degree}</h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {edu.period}
                  </div>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="font-medium">{edu.institution}</span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {edu.location}
                  </span>
                </div>
                <p className="text-gray-700">{edu.details}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
            Achievements & Recognition
          </h2>
          <ul className="space-y-2">
            {ACHIEVEMENTS.map((achievement, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-700">{achievement}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm">References available upon request</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a
              href="https://github.com/saugattimilsina"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/saugattimilsina"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
