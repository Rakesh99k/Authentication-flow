import React from 'react'
import { motion } from 'framer-motion'
import '../styles/global.css'

export default function NotFound() {
  return (
    <div className="page center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1>404 — Not Found</h1>
        <p>The page you requested does not exist.</p>
      </motion.div>
    </div>
  )
}
