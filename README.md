# A work-in-progress quiz generator using Nuxt3 and the OpenAI API

Users can create practice quizes on any topic (with varying quality)

Meant to be different to the existing quiz generator websites that make you sign up/pay to use them 
and force you to give context to generate a quiz from, which isn't always possible for students.

![A landing page](https://cdn.discordapp.com/attachments/1081089348046438400/1110243334712213546/image.png "The landing page")

Currently the UI doesn't really work on mobile.

## Deployment issues (resolved)
Attempt 1:

Deploying on Vercel edge functions resulted in an error I couldn't find any help for online.
All documentation points to just giving it the "vercel-edge" preset and it working.
Using serverless functions results in a timeout, so the version deployed on Vercel can't actually generate any quizzes until this bug is fixed.
Finally someone on the Nuxt Discord server said streaming just isn't very compatible with edge.

Attempt 2:

I find Render which looks to have a similarly generous free tier to Vercel but can run basic node instances.
Building succeeds, but when trying to run it I get another error related to Vuetify which no solutions found anywhere fix.
Eventually, I find a solution by messing with version numbers and it magically works.
