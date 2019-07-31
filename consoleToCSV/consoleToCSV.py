# my program from converting safari console for Tetris_AI to a csv file format

infilename = "Console_0_49.txt"
outfilename = "Console_0_49_cleaned.txt"
inputFile = open(infilename,"r")
outputFile = open(outfilename,"w")

for line in inputFile.readlines():
    tempStr = line.replace("[Log] ", "")
    tempStr = tempStr.replace(" (genetic-algorithm.js, line 324", "")
    tempStr = tempStr.replace(" (genetic-algorithm.js, line 191", "")
    tempStr = tempStr.replace(")", "")
    try:
        index = tempStr.index('x')
        mult = tempStr[index:-1]
        mult = int(mult.replace('x', ''))
        tempStr = (tempStr[0:index-2] + "\n") * mult
    except ValueError:
        print("Not found")

    outputFile.write(tempStr)






inputFile.close()
outputFile.close()
