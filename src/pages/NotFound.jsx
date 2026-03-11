// simple 404 page that informs user when route is missing
import React from 'react'
import { motion as Motion } from 'framer-motion'
import '../styles/global.css'

export default function NotFound() {
  return (
    <div className="page center">
      {/* animate fade in for nicer UX */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1>404 - Not Found</h1>
        <p>The page you requested does not exist.</p>
      </Motion.div>
    </div>
  )
}

