export interface AuthorInfo {
  nationality: string;
  years: string;
  bio: string;
}

export const AUTHOR_BIOS: Record<string, AuthorInfo> = {
  'Jane Austen': { nationality: 'English', years: '1775–1817', bio: 'She wrote six novels about love and life in England. Her books are known for their sharp wit and strong female characters.' },
  'Charles Dickens': { nationality: 'English', years: '1812–1870', bio: 'One of the most loved English writers of all time. His stories show the hard lives of poor people in Victorian London.' },
  'Mark Twain': { nationality: 'American', years: '1835–1910', bio: 'He was one of the most famous American writers. His book Huckleberry Finn is still read in schools around the world.' },
  'Leo Tolstoy': { nationality: 'Russian', years: '1828–1910', bio: 'He wrote War and Peace and Anna Karenina. Both are long, rich stories about life and love in Russia.' },
  'Fyodor Dostoevsky': { nationality: 'Russian', years: '1821–1881', bio: 'He wrote deep novels about crime, guilt, and faith. His stories deal with the dark side of human nature.' },
  'George Orwell': { nationality: 'British', years: '1903–1950', bio: 'He wrote Animal Farm and Nineteen Eighty-Four. Both books warn about the dangers of too much government control.' },
  'Oscar Wilde': { nationality: 'Irish', years: '1854–1900', bio: 'He was known for his quick wit and sharp humor. His plays and stories are still enjoyed all over the world.' },
  'Herman Melville': { nationality: 'American', years: '1819–1891', bio: 'He wrote Moby-Dick, a story about a sailor who hunts a great white whale. It is one of the most famous American novels ever written.' },
  'Charlotte Brontë': { nationality: 'English', years: '1816–1855', bio: 'She wrote Jane Eyre, a story about a young woman finding her place in the world. It is one of the best loved English novels.' },
  'Emily Brontë': { nationality: 'English', years: '1818–1848', bio: 'She wrote one novel, Wuthering Heights, set on the wild English moors. It is a dark and moving love story unlike any other.' },
  'Victor Hugo': { nationality: 'French', years: '1802–1885', bio: 'He wrote Les Misérables, one of the most famous French novels. It is a story about justice, love, and hope for the poor.' },
  'Gustave Flaubert': { nationality: 'French', years: '1821–1880', bio: 'He wrote Madame Bovary, a classic French novel. He was known for his careful writing and his search for the right word.' },
  'Franz Kafka': { nationality: 'Czech', years: '1883–1924', bio: 'He wrote strange stories about people trapped in odd, confusing worlds. His name is now used to describe any system that feels absurd and hard to deal with.' },
  'James Joyce': { nationality: 'Irish', years: '1882–1941', bio: 'He was one of the boldest writers of the 1900s. His most famous book, Ulysses, tells the story of one day in Dublin in great detail.' },
  'Virginia Woolf': { nationality: 'English', years: '1882–1941', bio: 'She was a key figure in modern English writing. Her books explore the inner thoughts and feelings of her characters.' },
  'F. Scott Fitzgerald': { nationality: 'American', years: '1896–1940', bio: 'He wrote The Great Gatsby, a short and famous American novel. It is a story about wealth, love, and the American Dream.' },
  'Ernest Hemingway': { nationality: 'American', years: '1899–1961', bio: 'He was known for his short, clear writing style. His stories deal with war, sport, and the search for meaning in life.' },
  'William Shakespeare': { nationality: 'English', years: '1564–1616', bio: 'He wrote 37 plays and 154 sonnets. Many people think he is the greatest writer in the English language.' },
  'Homer': { nationality: 'Greek', years: 'c. 8th century BC', bio: 'He is the poet behind the Iliad and the Odyssey. These two ancient Greek epics helped start the Western tradition of storytelling.' },
  'Dante Alighieri': { nationality: 'Italian', years: '1265–1321', bio: 'He wrote the Divine Comedy, a long poem about a journey through Hell and Heaven. It is one of the great works of world literature.' },
  'Miguel de Cervantes': { nationality: 'Spanish', years: '1547–1616', bio: 'He wrote Don Quixote, one of the first modern novels. It tells the story of a man who thinks he is a knight on a quest.' },
  'Jonathan Swift': { nationality: 'Irish', years: '1667–1745', bio: "He wrote Gulliver's Travels, a story full of sharp social comment. He used humor and irony to point out the faults of his time." },
  'Edgar Allan Poe': { nationality: 'American', years: '1809–1849', bio: 'He was one of the first great American horror writers. His dark poems and tales of terror are still widely read today.' },
  'Arthur Conan Doyle': { nationality: 'Scottish', years: '1859–1930', bio: "He created Sherlock Holmes, the world's most famous fictional detective. Holmes has appeared in stories, films, and TV shows for over 100 years." },
  'H.G. Wells': { nationality: 'English', years: '1866–1946', bio: 'He wrote some of the first great science fiction stories. The Time Machine and The War of the Worlds are among his most famous works.' },
  'Jules Verne': { nationality: 'French', years: '1828–1905', bio: 'He wrote exciting adventure stories set in the future. Books like Twenty Thousand Leagues Under the Sea were far ahead of their time.' },
  'Louisa May Alcott': { nationality: 'American', years: '1832–1888', bio: 'She wrote Little Women, a story about four sisters growing up. It is one of the most loved American novels of all time.' },
  'Thomas Hardy': { nationality: 'English', years: '1840–1928', bio: 'He wrote sad stories set in the English countryside. His novels deal with fate, love, and the limits placed on ordinary people.' },
  'Rudyard Kipling': { nationality: 'British', years: '1865–1936', bio: 'He wrote The Jungle Book and many other well known stories. He was the first English-language writer to win the Nobel Prize for Literature.' },
  'Robert Louis Stevenson': { nationality: 'Scottish', years: '1850–1894', bio: 'He wrote Treasure Island and Dr Jekyll and Mr Hyde. Both are classic stories that are still read and enjoyed today.' },
  'Jack London': { nationality: 'American', years: '1876–1916', bio: 'He wrote The Call of the Wild and other tales of survival. His stories deal with the power of nature and the will to live.' },
  'Bram Stoker': { nationality: 'Irish', years: '1847–1912', bio: 'He wrote Dracula, the most famous vampire story ever told. It set the rules for vampire fiction that writers still follow today.' },
  'Mary Shelley': { nationality: 'English', years: '1797–1851', bio: 'She wrote Frankenstein when she was just eighteen years old. It is one of the first great science fiction stories ever written.' },
};
