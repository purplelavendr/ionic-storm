// The unit/activity catalog. Add new units and activities here as the year goes on.
//
// Activity types:
//   'review' - a built-in interactive review. Needs a matching module registered
//              on window.Activities[activity.id] (see js/activities/*.js).
//   'link'   - an external simulation/tool. Student clicks through and checks
//              a box to mark it complete; no extra file needed.
const CONTENT = {
  units: [
    {
      id: 'unit1-defining-matter',
      title: 'Unit 1: Alchemy — Chapter 1: Defining Matter',
      description: 'Lab tools & safety, properties, chemistry, and the definition of matter (Lessons 1–3).',
      activities: [
        {
          id: 'matter-review',
          type: 'review',
          title: 'Chapter 1 Review: Defining Matter',
          description: 'A guided walkthrough of lab tools & safety, properties, and what counts as matter, ending in a graded check for understanding — good prep for Quiz A/B.',
          estimatedMinutes: 35
        }
      ]
    }
    // NOT LIVE YET -- built and ready, holding for a later publish date.
    // Uncomment this unit (and redeploy) whenever it's ready for students:
    // {
    //   id: 'mini-math-unit',
    //   title: 'Mini-Math Unit',
    //   description: 'A standalone algebra refresher on cross-multiplying and dividing, applied to density.',
    //   activities: [
    //     {
    //       id: 'cross-multiply-density',
    //       type: 'review',
    //       title: 'Density & Cross-Multiplying Practice',
    //       description: 'Practice cross-multiplying and dividing to solve density problems (D = m/V) with step-by-step drag-and-drop, worked practice, and a graded check.',
    //       estimatedMinutes: 38
    //     }
    //   ]
    // }
  ]
};
