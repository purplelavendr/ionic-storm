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
      id: 'unit1-atoms',
      title: 'Unit 1: Atoms, Ions & the Periodic Table',
      description: 'Structure of the atom, ions, and periodic trends.',
      activities: [
        {
          id: 'atoms-review',
          type: 'review',
          title: 'Atoms & Ions Review',
          description: '10 questions on protons, neutrons, electrons, ions, and periodic trends.',
          estimatedMinutes: 15
        },
        {
          id: 'phet-build-an-atom',
          type: 'link',
          title: 'PhET: Build an Atom',
          description: 'Build atoms and ions and see how particle counts change charge and mass.',
          url: 'https://phet.colorado.edu/en/simulations/build-an-atom',
          estimatedMinutes: 15
        }
      ]
    }
  ]
};
