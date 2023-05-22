# A work-in-progress quiz generator using Nuxt3 and the OpenAI API

Users can create practice quizes on any topic (with varying quality)

Meant to be different to the existing quiz generator websites that make you sign up/pay to use them 
and force you to give context to generate a quiz from, which isn't always possible for students.

![A landing page](https://cdn.discordapp.com/attachments/1081089348046438400/1110243334712213546/image.png "The landing page")

Currently the UI doesn't really work on mobile.

Deploying on Vercel edge functions results in an error I can't find any help for online or the Nuxt Discord.
All documentation points to just giving it the "vercel-edge" preset and it working.
Using serverless functions results in a timeout, so the version deployed on vercel can't actually generate any quizzes until this bug is fixed.