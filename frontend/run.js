const fetch = (...args) => import('node-fetch').then(({default: f})=>f(...args));

(async () => {
  const res = await fetch('https://ahlqzzkxuutwoepirpzr.supabase.co/functions/v1/create-payment-link', {
    method: 'POST',
    headers: {
      'Authorization':'Bearer <xZPv4SFQK46R/aMBQn/8E1aa90oEhvfqTiiKPzpHCtNCaCvjoORempMa1jcocFNc4Y/lOmCj+FaXqNkDiX3Vyg==>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: 100 }),
  });
  console.log('status', res.status);
  console.log(await res.text());
})();