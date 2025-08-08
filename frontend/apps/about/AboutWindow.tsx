"use client"

import { MapPin, Calendar } from "lucide-react"

export function AboutWindow() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
            ST
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Saugat Timilsina</h1>
          <p className="text-xl text-gray-600 mb-4">Full Stack Developer & AI Engineer</p>
          <div className="flex items-center justify-center space-x-4 text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Nepal</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Available for work</span>
            </div>
          </div>
        </div>

        {/* About Content */}
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">About Me</h2>
            <p className="text-gray-600 leading-relaxed">
              I'm a passionate Full Stack Developer with expertise in modern web technologies and AI integration. With a
              strong foundation in React, Next.js, and Node.js, I create scalable and user-friendly applications that
              solve real-world problems. I'm particularly interested in the intersection of web development and
              artificial intelligence, building intelligent applications that enhance user experiences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">What I Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Frontend Development</h3>
                <p className="text-gray-600 text-sm">
                  Creating responsive and interactive user interfaces with React, Next.js, and modern CSS frameworks.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Backend Development</h3>
                <p className="text-gray-600 text-sm">
                  Building robust APIs and server-side applications with Node.js, Express, and various databases.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">AI Integration</h3>
                <p className="text-gray-600 text-sm">
                  Implementing AI-powered features using machine learning models and natural language processing.
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Full Stack Solutions</h3>
                <p className="text-gray-600 text-sm">
                  End-to-end application development from concept to deployment with modern DevOps practices.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {["Machine Learning", "Web3", "Open Source", "UI/UX Design", "Cloud Computing", "DevOps"].map(
                (interest) => (
                  <span key={interest} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {interest}
                  </span>
                ),
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
