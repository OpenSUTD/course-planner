# Simple Course Planner.

##  Currently able to:
* Plan for course in consideration of pre-requisites, alternative pre-requisites (i.e 01.112/40.319)
* Plan for course in consideration of offered Terms
* Overload (Term 5,6,7)
* Browse brief course description
* Track recognition (ESD, ISTD)
* Minor recognition (ESD, ISTD, HASS)

## Future dev (upcoming in weeks to come)
* ASD
* dynamic dataset (web scrap)
* etc

## How to use
* Select your pillar
* Click Submit
* Hover over the box for course description
* Click the module's text to add into the calendar on the left
* Click any mod in the calendar(on the left) to remove the module
* Check overload box if you are overloading
* Track is automatically calculated
* ctrl-f to search for the course

### Data Description and Upkeep Template (Important)
#### (no trailing space for anything)
#### usually delimited by ; for multiple entry
#### \# as the secondary delimited, e.g choose 1 from \[01.112;40.319] and 1 from \[40.004;30.003;50.034] => 01.112;40.319#40.004;30.003;50.034
#### _courses.csv_
Subject: Name of the subject<br>
Code : Subject Code <br>
Description: General course description<br>
Core EPD/ESD/ASD/ISTD: 1 if core, 0 if not<br>
Term 4/5/6/7/8: 1 if available, 0 if not<br>
Pre-requisite: pre-requisite separate by ; <br>
Alt-requisite: requisites where you get to choose 1 from a set(i.e 01.112 or 40.319) 

#### _track.csv_
Track : Name of Track<br>
Required: Fixed required courses, i.e AI for AI track<br>
ReqOption: requirement where you get to choose 1 from a selection<br>
Option: Required Elective Options<br>
OptionNumber: Number of electives required<br>
Pillar : Pillar of the track being offered.<br>

#### data available at https://docs.google.com/spreadsheets/d/1U0CjPyIO5QSkeEE6_UD0plZh9k9K_YIbigzXHLnNG44/edit?usp=sharing (please copy and not change the master copy)
