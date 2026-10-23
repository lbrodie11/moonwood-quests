import type { ObjectiveId } from "../objectives";

export type StandardsJurisdiction = "US-CCSS" | "US-NC" | "NGSS";

export type StandardsEdition =
  | "CCSS-MATH-2010"
  | "CCSS-ELA-2010"
  | "NC-MATH-2018"
  | "NC-ELA-2017 (effective 2026-27)"
  | "NC-ELA-2026 (effective 2027-28)"
  | "NGSS-NC-SCI-2023";

export type CoverageLevel = "full" | "partial" | "enrichment";

export type ReviewStatus =
  | "verified-engineering"
  | "requires-educator-review"
  | "requires-bilingual-review";

export interface StandardMapping {
  /** Unique versioned standard identifier. */
  id: string;
  /** Official standard code in its jurisdiction (e.g., "1.OA.D.8", "NC.1.OA.8"). */
  code: string;
  jurisdiction: StandardsJurisdiction;
  edition: StandardsEdition;
  description: string;
  skillsAddressed: readonly ObjectiveId[];
  supportedTaskTypes: readonly string[];
  evidenceRequirements: string;
  /**
   * Honest coverage classification: if an in-game mechanic only assesses part
   * of a multi-part standard, it MUST be marked "partial".
   */
  coverageLevel: CoverageLevel;
  sourceUrl: string;
  reviewStatus: ReviewStatus;
}

/**
 * Versioned standards registry covering Common Core Grade 1 Math/ELA,
 * North Carolina Standard Course of Study Grade 1 Math (NC.1.*),
 * North Carolina 2017 ELA (effective 2026–27), and North Carolina 2026 ELA
 * (scheduled implementation 2027–28).
 */
export const STANDARDS_REGISTRY: readonly StandardMapping[] = [
  // --- Addition & Subtraction (CCSS + NC Math) ---
  {
    id: "CCSS.MATH.1.OA.A.1",
    code: "1.OA.A.1",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description:
      "Use addition and subtraction within 20 to solve word problems involving situations of adding to, taking from, putting together, taking apart, and comparing, with unknowns in all positions.",
    skillsAddressed: ["add-within-20", "subtract-within-20", "unknown-number-equations"],
    supportedTaskTypes: [
      "combine-mana-word-problem",
      "spend-mana-word-problem",
      "compare-quantities-word-problem",
      "missing-part-word-problem",
    ],
    evidenceRequirements:
      "Requires independent success across add-to, take-from, put-together/take-apart, and compare word-problem structures with unknowns in multiple positions.",
    coverageLevel: "partial",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/OA/",
    reviewStatus: "requires-educator-review",
  },
  {
    id: "CCSS.MATH.1.OA.B.3",
    code: "1.OA.B.3",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description:
      "Apply properties of operations as strategies to add and subtract (commutative and associative properties of addition; make-ten strategy).",
    skillsAddressed: ["add-within-20"],
    supportedTaskTypes: ["make-ten-strategy", "doubles-near-doubles", "commutative-turn-around"],
    evidenceRequirements:
      "Requires explicit demonstration or selection of make-ten decomposition or commutative equivalence, not merely correct sum selection.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/OA/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.MATH.1.OA.B.4",
    code: "1.OA.B.4",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description: "Understand subtraction as an unknown-addend problem (e.g., solve 10 - 8 by finding the number that makes 10 when added to 8).",
    skillsAddressed: ["subtract-within-20", "unknown-number-equations"],
    supportedTaskTypes: ["think-addition-for-subtraction", "unknown-addend-equation"],
    evidenceRequirements:
      "Requires linking a subtraction problem to its related unknown-addend equation across multiple item families.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/OA/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.MATH.1.OA.C.6",
    code: "1.OA.C.6",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description:
      "Add and subtract within 20, demonstrating fluency for addition and subtraction within 10; use strategies such as counting on, making ten, decomposing a number leading to a ten, and using the relationship between addition and subtraction.",
    skillsAddressed: ["add-within-20", "subtract-within-20"],
    supportedTaskTypes: [
      "fluency-within-10",
      "counting-on-addition",
      "make-ten-addition",
      "decompose-to-ten-subtraction",
    ],
    evidenceRequirements:
      "Fluency within 10 and strategy-supported accuracy within 20 across objects, number-line, and symbolic representations, verified on delayed retention.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/OA/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.MATH.1.OA.D.8",
    code: "1.OA.D.8",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description:
      "Determine the unknown whole number in an addition or subtraction equation relating three whole numbers (e.g., 8 + ? = 11, 5 = ? - 3, 6 + 6 = ?).",
    skillsAddressed: ["unknown-number-equations"],
    supportedTaskTypes: [
      "missing-second-addend",
      "missing-first-addend",
      "missing-subtrahend",
      "missing-minuend-reversed-equals",
    ],
    evidenceRequirements:
      "Requires solving equations with unknowns in all three positions and equations with the sum/difference on either side of the equal sign. Never satisfied by arithmetic sequence puzzles.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/OA/D/8/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.OA.1",
    code: "NC.1.OA.1",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description:
      "Represent and solve addition and subtraction word problems, within 20, with unknowns in all positions, by using objects, drawings, and equations with a symbol for the unknown number.",
    skillsAddressed: ["add-within-20", "subtract-within-20", "unknown-number-equations"],
    supportedTaskTypes: ["combine-mana-word-problem", "spend-mana-word-problem", "missing-part-word-problem"],
    evidenceRequirements: "Independent accuracy across multiple word-problem structures within 20.",
    coverageLevel: "partial",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "requires-educator-review",
  },
  {
    id: "NC.MATH.2018.NC.1.OA.3",
    code: "NC.1.OA.3",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Apply the commutative and associative properties as strategies for solving addition problems.",
    skillsAddressed: ["add-within-20"],
    supportedTaskTypes: ["make-ten-strategy", "commutative-turn-around"],
    evidenceRequirements: "Demonstrated use of commutative/associative grouping strategies.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.OA.4",
    code: "NC.1.OA.4",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Solve an unknown-addend problem, within 20, by using addition strategies and/or changing it to a subtraction problem.",
    skillsAddressed: ["subtract-within-20", "unknown-number-equations"],
    supportedTaskTypes: ["think-addition-for-subtraction", "unknown-addend-equation"],
    evidenceRequirements: "Independent success on unknown-addend and related subtraction items.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.OA.6",
    code: "NC.1.OA.6",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Add and subtract, within 20, using strategies such as counting on, making ten, decomposing a number leading to a ten, and using the relationship between addition and subtraction.",
    skillsAddressed: ["add-within-20", "subtract-within-20"],
    supportedTaskTypes: ["fluency-within-10", "counting-on-addition", "make-ten-addition", "decompose-to-ten-subtraction"],
    evidenceRequirements: "Independent strategy-supported mastery within 20 and fluency within 10.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.OA.8",
    code: "NC.1.OA.8",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Determine the unknown whole number in an addition or subtraction equation involving three whole numbers.",
    skillsAddressed: ["unknown-number-equations"],
    supportedTaskTypes: ["missing-second-addend", "missing-first-addend", "missing-subtrahend", "missing-minuend-reversed-equals"],
    evidenceRequirements: "Independent accuracy across all unknown positions in three-number equations.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },

  // --- Number & Operations in Base Ten / Patterns (CCSS + NC Math) ---
  {
    id: "CCSS.MATH.1.NBT.A.1",
    code: "1.NBT.A.1",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description: "Count to 120, starting at any number less than 120. In this range, read and write numerals and represent a number of objects with a written numeral.",
    skillsAddressed: ["star-patterns", "tens-and-ones"],
    supportedTaskTypes: ["count-sequence-within-120", "skip-count-pattern-enrichment", "extended-bundle-count-above-99"],
    evidenceRequirements:
      "Counting forward from arbitrary starting numbers up to 120; skip-counting pattern tasks provide enrichment/partial evidence for counting sequences.",
    coverageLevel: "enrichment",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/NBT/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.MATH.1.NBT.B.2",
    code: "1.NBT.B.2",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description:
      "Understand that the two digits of a two-digit number represent amounts of tens and ones (10 can be thought of as a bundle of ten ones; 11–19 are composed of a ten and ones; 10, 20, ..., 90 refer to one through nine tens).",
    skillsAddressed: ["tens-and-ones"],
    supportedTaskTypes: [
      "bundle-ten-ones",
      "compose-two-digit-tens-ones",
      "decompose-two-digit-number",
      "identify-swapped-digit-misconception",
      "equivalent-place-value-representation",
    ],
    evidenceRequirements:
      "Requires bundling 10 ones into 1 ten, decomposing two-digit numbers (10–99), and rejecting swapped-digit (34 vs 43) and additive (4 + 3 = 7) distractors. Numbers > 99 are tracked separately under 1.NBT.A.1.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/NBT/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.MATH.1.NBT.B.3",
    code: "1.NBT.B.3",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description: "Compare two two-digit numbers based on meanings of the tens and ones digits, recording the results of comparisons with the symbols >, =, and <.",
    skillsAddressed: ["tens-and-ones"],
    supportedTaskTypes: ["compare-two-digit-numbers"],
    evidenceRequirements: "Independent comparison of two-digit numbers including pairs with reversed digits (e.g., 27 vs 72).",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/NBT/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.NBT.1",
    code: "NC.1.NBT.1",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Count to 150, starting at any number less than 150.",
    skillsAddressed: ["star-patterns", "tens-and-ones"],
    supportedTaskTypes: ["count-sequence-within-120", "skip-count-pattern-enrichment"],
    evidenceRequirements: "Partial coverage up to 120; full NC.1.NBT.1 extends to 150.",
    coverageLevel: "partial",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.NBT.2",
    code: "NC.1.NBT.2",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Understand that the two digits of a two-digit number represent amounts of tens and ones (unitizing 10 ones as a group of ten).",
    skillsAddressed: ["tens-and-ones"],
    supportedTaskTypes: ["bundle-ten-ones", "compose-two-digit-tens-ones", "decompose-two-digit-number"],
    evidenceRequirements: "Bundling, composing, and decomposing two-digit numbers (10–99) without digit-reversal errors.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.NBT.3",
    code: "NC.1.NBT.3",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Compare two two-digit numbers based on the value of the tens and ones digits, recording the results of comparisons with the symbols >, =, and <.",
    skillsAddressed: ["tens-and-ones"],
    supportedTaskTypes: ["compare-two-digit-numbers"],
    evidenceRequirements: "Independent comparison of two-digit numbers using tens and ones place value.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },

  // --- Measurement & Data (CCSS + NC Math) ---
  {
    id: "CCSS.MATH.1.MD.A.1",
    code: "1.MD.A.1",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description: "Order three objects by length; compare the lengths of two objects indirectly by using a third object.",
    skillsAddressed: ["compare-lengths"],
    supportedTaskTypes: ["order-three-objects-by-length", "indirect-length-comparison-via-reference"],
    evidenceRequirements:
      "Requires ordering three planks/objects from shortest to longest (or longest to shortest) and comparing two objects indirectly via a reference crystal/plank.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/MD/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.MATH.1.MD.A.2",
    code: "1.MD.A.2",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description:
      "Express the length of an object as a whole number of length units, by laying multiple copies of a shorter object (the length unit) end to end; understand that the length measurement of an object is the number of same-size length units that span it with no gaps or overlaps.",
    skillsAddressed: ["compare-lengths"],
    supportedTaskTypes: ["measure-end-to-end-unit-tiles", "identify-invalid-gap-or-overlap-measurement"],
    evidenceRequirements:
      "Requires measuring objects with equal-size moon-tiles laid end-to-end and rejecting arrangements with gaps, overlaps, or unequal units.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/MD/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.MD.1",
    code: "NC.1.MD.1",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Order three objects by length; compare the lengths of two objects indirectly by using a third object.",
    skillsAddressed: ["compare-lengths"],
    supportedTaskTypes: ["order-three-objects-by-length", "indirect-length-comparison-via-reference"],
    evidenceRequirements: "Direct ordering of three lengths and transitive comparison via a third reference length.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.MD.2",
    code: "NC.1.MD.2",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Measure lengths with non-standard units by laying multiple copies of a shorter object end to end with no gaps or overlaps.",
    skillsAddressed: ["compare-lengths"],
    supportedTaskTypes: ["measure-end-to-end-unit-tiles", "identify-invalid-gap-or-overlap-measurement"],
    evidenceRequirements: "Accurate nonstandard unit iteration and identification of gap/overlap errors.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },

  // --- Geometry (CCSS + NC Math) ---
  {
    id: "CCSS.MATH.1.G.A.1",
    code: "1.G.A.1",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description:
      "Distinguish between defining attributes (e.g., triangles are closed and three-sided) versus non-defining attributes (e.g., color, orientation, overall size); build and draw shapes to possess defining attributes.",
    skillsAddressed: ["compose-shapes"],
    supportedTaskTypes: ["identify-defining-vs-nondefining-attributes", "build-shape-with-attributes"],
    evidenceRequirements:
      "Requires distinguishing closed/side/corner attributes from color, rotation, or scale across rotated distractors.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/G/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.MATH.1.G.A.2",
    code: "1.G.A.2",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description:
      "Compose two-dimensional shapes (rectangles, squares, trapezoids, triangles, half-circles, and quarter-circles) or three-dimensional shapes to create a composite shape, and compose new shapes from the composite shape.",
    skillsAddressed: ["compose-shapes", "creative-construction"],
    supportedTaskTypes: ["compose-2d-composite-shape", "interactive-sigil-tile-placement"],
    evidenceRequirements:
      "Requires constructing target composite shapes (e.g., hexagon from 2 trapezoids or 6 triangles, trapezoid from 3 triangles, larger square from 4 squares/triangles) through spatial placement/selection rather than arithmetic counting alone.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/G/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.MATH.1.G.A.3",
    code: "1.G.A.3",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description:
      "Partition circles and rectangles into two and four equal shares, describe the shares using the words halves, fourths, and quarters, and understand that decomposing into more equal shares creates smaller shares.",
    skillsAddressed: ["compose-shapes"],
    supportedTaskTypes: ["partition-halves-and-fourths", "equal-vs-unequal-shares"],
    evidenceRequirements:
      "Requires identifying equal halves/fourths of circles and rectangles and rejecting unequal partitions.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/Math/Content/1/G/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.G.1",
    code: "NC.1.G.1",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Distinguish between defining and non-defining attributes and create shapes with defining attributes.",
    skillsAddressed: ["compose-shapes"],
    supportedTaskTypes: ["identify-defining-vs-nondefining-attributes", "build-shape-with-attributes"],
    evidenceRequirements: "Independent identification of defining geometric attributes regardless of orientation or color.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.G.2",
    code: "NC.1.G.2",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Create composite shapes by composing two-dimensional or three-dimensional shapes and build new shapes from the composite shape.",
    skillsAddressed: ["compose-shapes", "creative-construction"],
    supportedTaskTypes: ["compose-2d-composite-shape", "interactive-sigil-tile-placement"],
    evidenceRequirements: "Spatial composition of 2D composite figures.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.MATH.2018.NC.1.G.3",
    code: "NC.1.G.3",
    jurisdiction: "US-NC",
    edition: "NC-MATH-2018",
    description: "Partition circles and rectangles into two and four equal shares and describe the shares as halves and fourths.",
    skillsAddressed: ["compose-shapes"],
    supportedTaskTypes: ["partition-halves-and-fourths", "equal-vs-unequal-shares"],
    evidenceRequirements: "Distinguishing equal halves and fourths from unequal shares.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/mathematics",
    reviewStatus: "verified-engineering",
  },

  // --- Foundational Reading, Comprehension, Vocabulary & Writing (CCSS + NC 2017 ELA + NC 2026 ELA) ---
  {
    id: "CCSS.ELA.RF.1.2",
    code: "RF.1.2",
    jurisdiction: "US-CCSS",
    edition: "CCSS-ELA-2010",
    description: "Demonstrate understanding of spoken words, syllables, and sounds (phonemes), including blending and segmenting single-syllable words.",
    skillsAddressed: ["phonics-words"],
    supportedTaskTypes: ["sound-recognition", "sound-blending", "phoneme-segmentation"],
    evidenceRequirements: "Independent phoneme identification, blending, and segmentation across initial, medial, and final positions.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/ELA-Literacy/RF/1/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.ELA.RF.1.3",
    code: "RF.1.3",
    jurisdiction: "US-CCSS",
    edition: "CCSS-ELA-2010",
    description:
      "Know and apply grade-level phonics and word analysis skills in decoding words (consonant digraphs, CVC, final -e, common vowel teams, inflectional endings, two-syllable words, and irregular words).",
    skillsAddressed: ["phonics-words", "spelling-writing"],
    supportedTaskTypes: ["word-building", "decoding", "connected-reading"],
    evidenceRequirements:
      "Requires prerequisite-ordered mastery from CVC through digraphs/blends, VCe, vowel teams, and decodable connected text without picture giveaways.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/ELA-Literacy/RF/1/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.ELA.2017.RF.1.3",
    code: "RF.1.3",
    jurisdiction: "US-NC",
    edition: "NC-ELA-2017 (effective 2026-27)",
    description:
      "Know and apply grade-level phonics and word analysis skills in decoding words (NC 2017 Standard Course of Study, effective through 2026–27 school year).",
    skillsAddressed: ["phonics-words", "spelling-writing"],
    supportedTaskTypes: ["sound-recognition", "sound-blending", "phoneme-segmentation", "word-building", "decoding", "connected-reading"],
    evidenceRequirements: "Cumulative decoding and encoding accuracy across taught grapheme-phoneme correspondences.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/office-teaching-and-learning/standard-course-study/english-language-arts/standard-course-study-supporting-resources",
    reviewStatus: "requires-bilingual-review",
  },
  {
    id: "NC.ELA.2026.1.F.PWS",
    code: "1.F.PWS",
    jurisdiction: "US-NC",
    edition: "NC-ELA-2026 (effective 2027-28)",
    description:
      "North Carolina 2026 ELA Standard Course of Study (Foundational Skills — Phonics and Word Study, scheduled for 2027–28 implementation): decode and encode words with consonant blends, digraphs, closed/open/VCe/vowel-team syllables, and high-frequency irregular words.",
    skillsAddressed: ["phonics-words", "spelling-writing"],
    supportedTaskTypes: ["sound-blending", "phoneme-segmentation", "word-building", "decoding", "connected-reading"],
    evidenceRequirements: "Systematic decoding and encoding across syllable types and connected decodable text.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/office-teaching-and-learning/standard-course-study/english-language-arts/standard-course-study-supporting-resources",
    reviewStatus: "requires-educator-review",
  },
  {
    id: "CCSS.ELA.RL.1.1",
    code: "RL.1.1",
    jurisdiction: "US-CCSS",
    edition: "CCSS-ELA-2010",
    description: "Ask and answer questions about key details in a text, retell stories, and describe characters, settings, and major events (RL.1.1–RL.1.3).",
    skillsAddressed: ["reading-comprehension"],
    supportedTaskTypes: [
      "literal-detail-comprehension",
      "story-sequencing",
      "cause-and-effect",
      "character-and-main-idea",
      "simple-inference-and-prediction",
    ],
    evidenceRequirements:
      "Tracked separately for independent reading vs. narrated listening; independent reading comprehension requires reading without full-passage TTS.",
    coverageLevel: "full",
    sourceUrl: "https://www.thecorestandards.org/ELA-Literacy/RL/1/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.ELA.2017.RL.1.1",
    code: "RL.1.1",
    jurisdiction: "US-NC",
    edition: "NC-ELA-2017 (effective 2026-27)",
    description: "Ask and answer questions about key details in a text and retell stories demonstrating understanding of the central message.",
    skillsAddressed: ["reading-comprehension"],
    supportedTaskTypes: ["literal-detail-comprehension", "story-sequencing", "cause-and-effect", "character-and-main-idea"],
    evidenceRequirements: "Separate tracking of listening comprehension and independent reading comprehension.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/office-teaching-and-learning/standard-course-study/english-language-arts/standard-course-study-supporting-resources",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NC.ELA.2026.1.RC.L",
    code: "1.RC.L",
    jurisdiction: "US-NC",
    edition: "NC-ELA-2026 (effective 2027-28)",
    description:
      "North Carolina 2026 ELA Standard Course of Study (Reading Comprehension — Literary Texts, effective 2027–28): sequence events, explain cause/effect, and make text-based inferences.",
    skillsAddressed: ["reading-comprehension"],
    supportedTaskTypes: ["literal-detail-comprehension", "story-sequencing", "cause-and-effect", "simple-inference-and-prediction"],
    evidenceRequirements: "Independent reading comprehension distinguished from oral listening comprehension.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/office-teaching-and-learning/standard-course-study/english-language-arts/standard-course-study-supporting-resources",
    reviewStatus: "requires-educator-review",
  },
  {
    id: "CCSS.ELA.L.1.5",
    code: "L.1.5",
    jurisdiction: "US-CCSS",
    edition: "CCSS-ELA-2010",
    description:
      "With guidance and support from adults, demonstrate understanding of word relationships and nuances in word meanings (sort words into categories, define words by category and attributes, distinguish shades of meaning).",
    skillsAddressed: ["vocabulary-oral"],
    supportedTaskTypes: ["category-sorting", "word-meaning-in-context", "synonym-antonym-comparison", "parent-assisted-oral-explanation"],
    evidenceRequirements:
      "Receptive vocabulary and categorization measured in-game; expressive oral language uses parent-assisted participation without automated speech scoring.",
    coverageLevel: "partial",
    sourceUrl: "https://www.thecorestandards.org/ELA-Literacy/L/1/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.ELA.L.1.2",
    code: "L.1.2",
    jurisdiction: "US-CCSS",
    edition: "CCSS-ELA-2010",
    description:
      "Demonstrate command of the conventions of standard English capitalization, punctuation, and spelling when writing (capitalize dates/names, use end punctuation, use conventional spelling for words with common spelling patterns).",
    skillsAddressed: ["spelling-writing"],
    supportedTaskTypes: ["letter-tile-encoding", "sentence-ordering", "capitalization-and-end-punctuation", "creative-writing-starter"],
    evidenceRequirements:
      "Constrained encoding and sentence mechanics validated automatically; open-ended writing uses self-reflection and parent review.",
    coverageLevel: "partial",
    sourceUrl: "https://www.thecorestandards.org/ELA-Literacy/L/1/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "CCSS.MATH.MP.1",
    code: "MP.1",
    jurisdiction: "US-CCSS",
    edition: "CCSS-MATH-2010",
    description: "Make sense of problems and persevere in solving them; reason abstractly and quantitatively (MP.1, MP.2, MP.7).",
    skillsAddressed: ["logical-reasoning", "creative-construction"],
    supportedTaskTypes: ["deductive-rule-elimination", "multi-step-path-planning", "metacognitive-strategy-reflection", "multi-solution-construction"],
    evidenceRequirements:
      "Demonstrated deductive reasoning and multi-step planning; subjective strategy reflections are never graded as right or wrong.",
    coverageLevel: "enrichment",
    sourceUrl: "https://www.thecorestandards.org/Math/Practice/",
    reviewStatus: "verified-engineering",
  },
  {
    id: "NGSS.1.LS1.1",
    code: "1-LS1-1",
    jurisdiction: "NGSS",
    edition: "NGSS-NC-SCI-2023",
    description:
      "Observe and classify living vs. nonliving things, plant and animal survival needs, habitats, seasonal daylight/weather patterns, and observable material properties, distinguishing real science from story magic.",
    skillsAddressed: ["science-nature"],
    supportedTaskTypes: ["habitat-matching", "plant-needs-and-lifecycle", "living-vs-nonliving", "seasons-and-materials", "magic-vs-real-science"],
    evidenceRequirements:
      "Requires accurate scientific classification and explicit differentiation between fantasy story magic and real-world scientific causes.",
    coverageLevel: "full",
    sourceUrl: "https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards/standard-course-study/science",
    reviewStatus: "verified-engineering",
  },
] as const;

export function standardsForObjective(objectiveId: ObjectiveId): readonly StandardMapping[] {
  return STANDARDS_REGISTRY.filter((entry) => entry.skillsAddressed.includes(objectiveId));
}

export function validateStandardsRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const s of STANDARDS_REGISTRY) {
    if (seenIds.has(s.id)) {
      errors.push(`Duplicate standard id: ${s.id}`);
    }
    seenIds.add(s.id);
    if (!s.sourceUrl.startsWith("https://")) {
      errors.push(`Standard ${s.id} must have an https sourceUrl`);
    }
    if (s.skillsAddressed.length === 0) {
      errors.push(`Standard ${s.id} addresses no skills`);
    }
    if (s.supportedTaskTypes.length === 0) {
      errors.push(`Standard ${s.id} lists no supportedTaskTypes`);
    }
    if (s.code === "1.OA.D.8" || s.code === "NC.1.OA.8") {
      if (s.skillsAddressed.includes("star-patterns")) {
        errors.push(`Standard ${s.id} (${s.code}) must not map to sequence puzzle 'star-patterns'`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
