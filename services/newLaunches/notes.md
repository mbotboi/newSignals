## Current Scoring Method As of 7th October 2024

Analysis and observations:
- Sniped Dumped tokens tend to have an overall higher score. Hard to differentiate
- But most of them dont have the call data that are present, therefore CPW is a great indicator of quality for now
- weightedAvgCPW > 1k tends to be a decent indicator of safeness/potential return
- tokens that have CPW = 0 are hit or miss when it comes to predictability
  - Suggestion would be to try and track callAnalyzer for tokens existing in DB -> would be a lot of parsing AAA

I believe I am finished with trying to improve my scoring system for now. I would like to have it active so that I can continuously improve the data as i 

1. acquire more data via the running it live
2. at the same time figure out how to improve scoring by improving the existing scoring method on the same feature set
3. acquire new methods to pull new feature sets

# IDEA FOR TG MESSAGING
1. Bot that sends messages only to me -> full params and data displayed
2. bot that sends data to private group -> only price metrics and score -> dont reveal the secret
3. my telegram bot should only accept commands from me, as its quite detrimental otherwise
