import React from 'react'

export default function AboutContent() {
  return (
    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl text-emerald-900">
      <h2 className="text-3xl font-bold mb-8 text-center">About Us</h2>
      
      <div className="space-y-8">
        {/* Inspiration Section */}
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            At the heart of our journey lies a profound inspiration from the words of the Prophet Muhammad (ﷺ):
          </p>
          <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-emerald-50 italic">
            &ldquo;The example of a man who has memorised the Qur&apos;an is like that of a hobbled camel. If he remained vigilant, he would be able to retain it (with him), and if he loosened the hobbled camel it would escape.&rdquo;
            <footer className="text-sm mt-2 text-emerald-700">
              (Sahih Muslim)
            </footer>
          </blockquote>
          <p className="leading-relaxed">
            Our vision is rooted in this powerful metaphor—a reminder of the delicate relationship between the memorizer and the Quran. Just as a hobbled camel requires constant attention to prevent it from wandering away, so too does the Quran demand continuous engagement to remain firmly planted in our hearts.
          </p>
        </div>

        {/* Mission Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Our Mission</h3>
          <p className="leading-relaxed">
            We are dedicated to empowering Quran memorizers with the tools and guidance they need to stay vigilant in their memorization journey. Our app is more than a tracker—it is a companion that:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>Supports your revision by making it structured and manageable.</li>
            <li>Encourages consistency through personalized reminders and insights.</li>
            <li>Strengthens your connection to the Quran by keeping its words fresh in your mind.</li>
          </ul>
        </div>

        {/* Why We Exist Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Why We Exist</h3>
          <p className="leading-relaxed">
            In an age of distractions, we understand the challenges of staying consistent in Quran memorization and revision. Many memorizers struggle with losing what they&apos;ve worked so hard to retain, simply because they lack a structured system to keep up with their revisions.
          </p>
          <p className="leading-relaxed">
            This is where our platform comes in. By integrating modern technology with a timeless message, we aim to help you safeguard your Quranic memorization, ensuring it becomes a source of guidance, light, and blessing in your life.
          </p>
        </div>

        {/* Vision Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Our Vision</h3>
          <p className="leading-relaxed">
            We envision a global community of Quran memorizers who not only retain the Quran in their hearts but also embody its teachings in their lives. Through consistent revision and deep connection, we aspire to help every user fulfill the responsibility and honor of carrying Allah&apos;s words.
          </p>
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Join Us on This Journey</h3>
          <p className="leading-relaxed">
            Whether you are just beginning your memorization or looking to strengthen what you&apos;ve already learned, our app is designed to meet you where you are. Together, let&apos;s keep the Quran alive in our hearts—one revision at a time.
          </p>
        </div>
      </div>
    </div>
  )
} 