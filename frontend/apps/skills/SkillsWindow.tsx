"use client"

import { Card } from "@/components/ui/Card"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { getColorClasses } from "@/utils/colors"
import { SKILL_CATEGORIES } from "@/constants"

export function SkillsWindow() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Skills & Technologies</h1>
          <p className="text-gray-600">My technical expertise and proficiency levels</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SKILL_CATEGORIES.map((category, index) => {
            const colorClasses = getColorClasses(category.color)

            return (
              <Card key={index} className={`border ${colorClasses.border} ${colorClasses.bg}`}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <category.icon className={`w-6 h-6 mr-3 ${colorClasses.text}`} />
                    <h2 className={`text-xl font-semibold ${colorClasses.text}`}>{category.title}</h2>
                  </div>

                  <div className="space-y-3">
                    {category.skills.map((skill, skillIndex) => (
                      <div key={skillIndex}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-medium ${colorClasses.text}`}>{skill.name}</span>
                          <span className={`text-sm ${colorClasses.text}`}>{skill.level}%</span>
                        </div>
                        <ProgressBar value={skill.level} color={category.color} />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Certifications */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Certifications & Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">AWS Cloud Practitioner</h3>
                <p className="text-gray-600 text-sm">Amazon Web Services</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">React Developer</h3>
                <p className="text-gray-600 text-sm">Meta (Facebook)</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">Full Stack Development</h3>
                <p className="text-gray-600 text-sm">freeCodeCamp</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
