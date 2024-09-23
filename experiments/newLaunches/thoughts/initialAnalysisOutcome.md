# OUTCOME OF INITIAL STUDY
**Distribution of labels:**
okay: 11 coins
decent: 8 coins
good: 0 coins
great: 10 coins
snipedDumped: 17 coins
bad: 0 coins
rug: 3 coins


**Score ranges by label:**
okay: 24.21 to 37.36
decent: 24.47 to 46.42
great: 24.21 to 63.76
snipedDumped: 14.45 to 59.37
rug: 19.09 to 44.06


**Key observations:**
- There's significant overlap in score ranges across different labels.
- Some "snipedDumped" coins have higher scores than "okay" or even "great" coins.
- The highest scoring coin (63.76) is labeled as "great", but the second highest (59.37) is labeled as "snipedDumped".
- There are no coins labeled as "good" or "bad", suggesting potential issues with the labeling system or data collection.
- "Rug" coins don't consistently have the lowest scores, which is counterintuitive.


**General Experience-Based Observations**
- The 1 hour trading data does not do a good job in filtering the good from the filth
- What other data can I extract??
- Sentiment/Socials
  - Twitter scraping 
    - is expensive
  - TG group scraping?? 
    - requires unsafe use of my personal telegram API -> maybe its what I should do???
  - CallAnalyzer
    - Tokens with calls > 4 tend to perform better, but they also tend to be late
    - But they tend to be slow???
      - PROVE -> for each of these coins -> scrape CallAnalyser and see when the first call was made. If within the first hour, I can potentially add this to my scoring.

**Potential Further Datapoints**
- For example adding LP V3. A wallet sending 1% supply to many wallets after launch, ...(CM EXAMPLE)
- Trading behaviour as indicator
  - Maybe 90% volume done by X% of wallets ?
  - aggregation of buys and sells
- Check call analyser for each of the existing tokens to see when first calls were made
- see relationship between MC, Volume, liquidity and their ratios to each other as a predictor