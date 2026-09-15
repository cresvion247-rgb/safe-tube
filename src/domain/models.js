// Domain models (plain contracts, no platform imports).
// These shapes are the stable contract between UI, adapters, and the backend function.

/**
 * AgeGroup = "toddler_2_4" | "early_learner_5_7" | "tween_8_12"
 * Category = "STEM" | "Arts" | "Emotional_Intelligence" | "Wholesome_Entertainment"
 *
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} childName
 * @property {string} ageGroup
 * @property {string[]} targetLanguages   ISO-639-1 codes
 * @property {number} dailyTimeLimitMinutes
 * @property {number} currentTimeSpent     seconds watched today
 * @property {string} lastActiveDate       YYYY-MM-DD (daily counter reset anchor)
 * @property {number} educationalTokens
 * @property {number} comprehensionScore   0-100, feeds adaptive level
 *
 * @typedef {Object} Video
 * @property {string} id                    YouTube video id
 * @property {string} title
 * @property {string} description
 * @property {string} channelId
 * @property {string} channelTitle
 * @property {string} category              Category
 * @property {string} language              ISO-639-1
 * @property {number} durationSeconds
 * @property {number} viewCount
 * @property {string} thumbnail
 *
/**
 * @typedef {Object} VideoLearning
 * @property {{term: string, meaning: string}[]} vocabulary
 * @property {{text: string, options: string[], correctIndex: number, atSeconds: number}[]} questions
 * @property {{text: string, options: string[], correctIndex: number}} endQuestion
 *
 * @typedef {Object} Channel
 * @property {string} channelId             UC... id once resolved
 * @property {string|null} name             display name; used as search query until resolved
 * @property {string} ageGroup
 * @property {string[]} categories
 * @property {string} nativeLanguage
 * @property {string} [addedBy]             "parent" for custom channels
 * @property {string} [status]              "approved" for parent-curated channels
 */
export {};