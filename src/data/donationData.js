export const categories = [
    {
      id: 'sadaqa',
      name: 'Sadaqa',
      description: 'Voluntary charity given out of compassion'
    },
    {
      id: 'zakat',
      name: 'Zakat',
      description: 'Annual obligatory charity'
    },
    {
      id: 'fidya',
      name: 'Fidya',
      description: 'Compensation for missed fasts'
    }
  ];
  
  export const programs = {
    sadaqa: [
      {
        id: 'food',
        name: 'Food Distribution',
        description: 'Provide meals to those in need'
      },
      {
        id: 'education',
        name: 'Education Support',
        description: 'Support student education'
      },
      {
        id: 'emergency',
        name: 'Emergency Relief',
        description: 'Help in crisis situations'
      }
    ],
    zakat: [
      {
        id: 'poor',
        name: 'Poor Relief',
        description: 'Direct support to the needy'
      },
      {
        id: 'debt',
        name: 'Debt Relief',
        description: 'Help those in financial difficulty'
      }
    ],
    fidya: [
      {
        id: 'meals',
        name: 'Meal Distribution',
        description: 'Provide meals as compensation'
      }
    ]
  };