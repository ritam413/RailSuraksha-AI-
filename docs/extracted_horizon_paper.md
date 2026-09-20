# Extracted Text: C:\Users\LENOVO\Downloads\papers\horizon.pdf

**Total Pages:** 12

## --- PAGE 1 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
IEEE TRANSACTIONS ON RELIABILITY 1
A Rolling-Horizon Approach for Predictive
Maintenance Planning to Reduce the
Risk of Rail Service Disruptions
Alice Consilvio , Angela Di Febbraro , and Nicola Sacco , Member , IEEE
Abstract—This article proposes a model for the risk-based
scheduling of predictive maintenance activities on a railway line
to intervene when a track segment has reached a certain state
of degradation, thus preventing faults and possible failures. With
the aim of taking into account the stochastic nature of real en-
vironments, the rail-track degradation process is represented as
a stochastic process, and the failure probability is evaluated as
the probability of reaching a degradation threshold. Moreover, a
rolling-horizon framework is introduced to manage newly available
real-time information and unpredicted faults or maintenance ac-
tivity delays. Whereas the traditional scheduling models are ofﬂine
models that cover the long-term horizon but neglect operational
disturbances, the presented model allows for dynamic day-to-day
planning and adaptation of the maintenance plan to real-time
information, thereby responding to the increasing understanding
of real-world processes. The optimization problem on maintenance
scheduling is formulated as a mixed-integer linear programming
problem based on risk minimization, in adherence to ISO 55 000
guidelines. Finally, the application of the approach to a real rail
network is reported and discussed, with a focus on the planning of
tamping activities at the operational level.
Index Terms —Decision support systems (DSS), dynamic
planning, railway predictive maintenance, track degradation
stochastic models.
I. I NTRODUCTION
R
AILW A Y maintenance is key to ensuring the reliability
and effectiveness of a railway transportation system. Any
asset of a railway system needs very carefully planned main-
tenance activities, aimed at guaranteeing its availability at all
times. Nevertheless, maintenance planning in the rail sector
must address the speciﬁc constraints of rail operations. Railway
infrastructures have the common characteristic of rarely being
redundant (i.e., there are no or very few alternative paths),
which implies that when a failure occurs, system performance
experiences a dramatic drop. Moreover, railway maintenance
Manuscript received May 27, 2019; revised December 29, 2019 and June
11, 2020; accepted July 2, 2020. Associate Editor: M. J. Zuo. (Corresponding
author: Nicola Sacco).
The authors are with the Department of Mechanical, Energy, Manage-
ment, and Transportation Engineering, University of Genoa, 16145 Genoa,
Italy (e-mail: alice.consilvio@edu.unige.it; angela.difebbraro@unige.it; nicola.
sacco@unige.it).
Color versions of one or more of the ﬁgures in this article are available online
at https://ieeexplore.ieee.org.
Digital Object Identiﬁer 10.1109/TR.2020.3007504
must take into account the space-distributed aspect of railway
infrastructure. Railway assets are often not spatially delimited to
a certain point, which implies difﬁculties in the organization of
maintenance activities and resources. Another aspect that makes
railway maintenance critical is the time constraint. In fact, the
available time for maintenance is very limited due to various
factors, such as railroad trafﬁc, climate, and interrelations among
different maintenance projects. Some of these requirements
result in soft constraints, i.e., violations that can be tolerated
if no better choices exist, while others are hard constraints that
can never be violated.
To cope with this problem, many maintenance approaches
have been developed in the relevant literature. Among these are:
1) planned maintenance, performed on a regular, ﬁxed time
schedule. It can lead to a signiﬁcant reduction in the
useful life of components due to early replacement and
unnecessary ap r i o r ischeduled maintenance activities;
2) condition-based maintenance, performed only when nec-
essary, on the basis of the continuously monitored asset
conditions. This approach allows for better usage of in-
frastructure components but requires regular and frequent
monitoring of the degradation state of railway assets;
3) predictive maintenance, performed only when necessary,
on the basis of suitable model estimations.
The last approach, which is considered in the present work,
guarantees the greatest reduction in maintenance costs, since
maintenance is performed only when necessary, with a limited
number of monitoring measures required. To this end, the aim of
predictive railway maintenance is minimizing the probability of
the occurrence during train service of so-called mission-critical
faults, i.e., those that prevent trains from circulating, leading
to service disruptions, while keeping maintenance costs as low
as possible. Nevertheless, the planning of rail maintenance is
still based on long-term planned maintenance strategies, with
static decisions manually deﬁned by the human operator and
rediscussed only in case of critical events, without automatic
support.
This article is aimed at addressing the abovementioned situa-
tion, supporting maintenance decision-makers in case of the oc-
currence of unexpected events, taking into account, in quasi-real
time, information and data from the ﬁeld. This work represents
the extension of previous research on the ofﬂine scheduling of
railway predictive maintenance activities [1]. While the previous
0018-9529 © 2020 IEEE. Personal use is permitted, but republication/redistribution requires IEEE permission.
See https://www.ieee.org/publications/rights/index.html for more information.
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 2 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
2 IEEE TRANSACTIONS ON RELIABILITY
study was aimed at developing a model to plan interventions
on the technological assets of a rail network when they reach
a certain degradation state, the present study introduces the
management of uncertainty in maintenance planning and deals
with a different application. In particular, the focus of this article
is on determining the maintenance deadlines for a maintenance
scheduling problem by means of a predictive model of rail
vertical deformation, characterized by spatial discretization and
uncertainties.
The whole approach is based on the risk minimization frame-
work, according to ISO 55 000 guidelines [2], and introduces
the concept of risk in railway maintenance activities’ scheduling.
This implies that maintenance activities’ priorities are based on
certain criticality indexes that take into account both the prob-
ability of a failure event and the relevant losses. A degradation
model is proposed to evaluate the probability of rail track failure.
In addition, the proposed approach allows for the dynamic
adaptation of maintenance schedules in reaction to the occur-
rence of unexpected events that characterize real environments,
such as unpredicted signiﬁcant degradations. To deal with this
aspect, an online recovery methodology based on a rolling-
horizon (RH) approach, aiming at scheduling fault diagnosis
and fault management activities, is considered.
The main innovative aspects are the possibility of shifting
from the corrective and planned maintenance strategies that are
currently in use to predictive maintenance strategies for rail
track, and from manual procedures based on operators judgment
to an automated decision process based on the data analysis and
optimization algorithms.
This article describes how the presented approach allows for
1) early/timely identiﬁcation and correction of critical de-
fects and the mitigation of the risk of service disruptions;
2) optimization of maintenance plans based on the correct
estimation of current and future infrastructure conditions;
3) efﬁcient exploitation of track access times (maximiza-
tion of the number of activities executed in the available
time frame, reduction of the time needed to complete the
planned maintenance activities);
4) a high level of ﬂexibility in the maintenance process,
including in cases of unexpected events, fostering service
resiliency.
The article is organized as follows. In Section II, the existing
literature on maintenance scheduling and recovery models is
analyzed. In Section III-V, the stochastic degradation model
and the mathematical formulation of the planning problem are
presented. Finally, an application of the proposed approach to
a Swedish rail line, the results and some indications on future
developments are discussed.
II. L ITERA TUREREVIEW
Preventive maintenance works are carried out to reduce
the probability of the occurrence of failures and to improve
the overall reliability and availability of a system. Poorly de-
signed preventive maintenance schedules may incur high main-
tenance and operational costs and loss of safety. Therefore,
the literature paid great attention to railway maintenance
scheduling problems. Many researchers agreed on the need to
move from planned preventive maintenance to predictive pre-
ventive maintenance [3]. In the rail sector, automatic monitoring
and diagnostic systems, both mounted aboard trains and track-
side, have become increasingly signiﬁcant and sophisticated,
and suitable models are necessary to efﬁciently use the newly
available data to estimate when a fault is likely to occur and
adapt maintenance interventions accordingly [4]. Scheduling
models for predictive maintenance must be able to reduce both
the overall maintenance budget and the safety risk, evaluating
the priority of maintenance tasks, taking into account not only
assets’ degradation conditions but also asset criticalities. One
fault may be better tolerated by the system than another, based
on the related consequences. In previous literature, the most
common optimization criteria for railway maintenance were
based on cost minimization to reduce the overall maintenance
budget. Today, the aim of predictive maintenance scheduling
is to minimize both the time duration and overall costs of
maintenance, to plan maintenance activities by assigning them to
the available teams, and to maximize the system’s reliability and
availability at the same time [5]–[7]. More speciﬁcally, mathe-
matical models were developed to determine the assignment and
schedules of maintenance teams to minimize the disruption of
train operations and the infrastructure possession time [8]–[11].
Such models take into account budget constraints, train sched-
ules, maintenance teams’ travel times, and various interrelations
among maintenance activities. The solutions consist of heuristic
approaches such as the tabu search approach and the simpler
greedy heuristic. Nevertheless, they do not take into account
data on the infrastructure conditions provided by monitoring
systems. Some steps forward in this direction were described
in [12]–[16]. In fact, these models aim to minimize the proba-
bility of mission-critical faults during train service, keeping the
railway track at good safety and comfort levels. The used data
from special diagnostic trains and new inspection technologies
to evaluate current track conditions. The increased availability of
data allow for the development of a data-driven strategy to assess
infrastructure conditions [17]–[19]. On the other hand, [20]–
[23] developed tools based on predictive degradation models,
providing important steps from condition-based maintenance
toward predictive maintenance. In these approaches, track con-
dition data allow for prediction of faults and determination of
which maintenance work is required for safe train operation and
whether safety-related speed restrictions are necessary. These
models enable long-term forecasts of rail conditions [24] and
strategic maintenance decisions that also consider the uncer-
tainties of the deterioration process, but they do not consider
asset criticalities. In other works [25]–[27], reliability concepts
were applied to plan periodic maintenance while also taking
into account asset criticalities by means of failure mode effect
and criticality analysis or Bayesian network procedures. These
approaches incorporate risk-based methodologies to estimate
the optimal time of replacement or repair of a railway structure,
but they do not take into account a predictive model of asset
conditions.
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 3 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
CONSILVIO et al.: RH APPROACH FOR PREDICTIVE MAINTENANCE PLANNING TO REDUCE THE RISK 3
Therefore, in the literature, many different approaches to the
scheduling of maintenance activities were proposed; neverthe-
less, new steps forward are needed to adapt railway maintenance
scheduling to both predictive models’ inputs and risk-based
asset management standards [28]. In this context, the present
study aims to provide a systemic view of how scheduling
models can use the signiﬁcant outputs of predictive tools and
degradation models based on railway ﬁeld data to achieve a
risk-based maintenance plan that can be adapted according
to updated inputs. As mentioned, in real environments, pre-
dictive maintenance scheduling must address the occurrence
of unexpected events due to the intrinsically stochastic nature
of the system. The problems of uncertainty in the scheduling
process and the discrepancy between theoretical schedules and
real system behavior were faced in the literature evaluating the
risk associated with the occurrence of unfavorable events, such
as machine unavailability or delays [29], [30]. Other studies
considered dynamic rescheduling to achieve fault recovery in
real-time systems [31], [32]. Regarding maintenance schedul-
ing, Ma et al. [33] dealt with the fact that a maintenance schedule
is enacted based on a statistical average. This still presents the
unavoidable risk that the system might fail before the criteria
are exceeded: a failure might occur unexpectedly. Nevertheless,
in the railway ﬁeld, rescheduling research was mostly applied
to train disruptions for the management of rail trafﬁc in case of
delays or unexpected events [34], [35]. Other works considered
the problem of train rescheduling under uncertainties due to
infrastructure maintenance [36], [37]. Some steps towards the
management of uncertainty in rail maintenance were made by
Osman et al. [38], who identiﬁed potential sources of disruption
to predetermined track inspection schedules, such as loss of
crews, machine breakdowns, and special inspection requests,
and by Su et al. [39], who presented a multilevel planning
model for railway maintenance, highlighting the uncertainty
at different planning levels and proposing a scenario-based
approach to dealing with it. Nevertheless, these studies focused
on a condition-based maintenance strategy, presenting a cyclical
approach to updating inspection schedules. The present work
introduces uncertainty management within a predictive main-
tenance framework, reducing the computational effort of the
stochastic programming model described in [40], which deals
with rail track maintenance by introducing a large number of
constraints associated with samples of the random variables
representing the uncertain deadlines derived from predictive
models.
III. D EGRADA TION ANDDEADLINE MODELS
This section describes the risk-based approach to determining
the set of rail stretches to be maintained starting from a stochastic
degradation model. To this end, since a data analysis is outside
the scope of the present study, the rail vertical deformation
model provided by Famurewaet al. [41], [42] is considered. This
model, developed by means of data collected by measurement
cars from 2011 to 2016 on a single track line in Sweden,
provides the rail deformation over time of the given rail stretches.
TABLE I
NOTATION FOR THE CONSIDERED DEGRADA TIONMODEL
Nevertheless, although the authors introduced the notion of
deformation uncertainty, their determination of the deadlines for
maintenance interventions neglected this factor and considered
only the average deformation.
From the physical point of view, it is then possible that the
average deformation falls within the thresholds while at some
points, the real proﬁle may exceed these limits. A sketch of this
condition is depicted in Fig. 1.
In this article, to evaluate the probability that the deforma-
tion exceeds the relevant threshold, the model uncertainty is
explicitly considered. The relevant notation is summarized in
Table I. The vertical deformation model proposed in [41], [42]
for determining the spatial average (computed over the whole
length) of the vertical rail deformation of the generic rail stretch
i ∈R is expressed as
δi(τ,τ i
k)=δ i(τi
k)exp(αiτ)+ϵ (1)
and is a random variable. In addition, in (1), δi(τi
k) is the
average deformation along the rail stretchi after the maintenance
performed in τi
k, and δi(τ,τ i
k) is the average deformation in a
generic instant τ>τ i
k. In addition, ϵ∈N (0,σ 2) is a Gaussian
random variable with null expectation modeling the deformation
uncertainty due to the model approximations, measurement er-
rors, and punctual deviation of the real value of the deformation
with respect to the average predicted by (1). The random variable
ϵis assumed to be independent of the particular rail stretch.
As mentioned, the model parameters, the initial deformation
δi(τi
k), the coefﬁcient αi, and the variance σ2 are determined
via ﬁeld data from [41], [42] and hereafter are assumed to be
known.
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 4 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
4 IEEE TRANSACTIONS ON RELIABILITY
Fig. 1. Rail proﬁle. A comparison of the nominal rail proﬁle (dashed line), the predicted average deformation in (1) (dashed-dotted line), the positi ve/negative
thresholds (dotted lines), and the real rail proﬁle along the 200 m rail stretch (thick continuous line).
Fig. 2. Gaussian stochastic process. The thick line represents the expectation
of the different Gaussian random variables δi(τ,τ i
k ),∀τ .
According to the model in (1), the deformation δi(τ,τ i
k)
results in a Gaussian stochastic process with time-dependent
expectation E[δi(τ,τ i
k)] =δi(τi
k)exp(αiτ) and constant vari-
ance σ2. As a consequence, at any time τ , there is a nonzero
probability Pr{δi(τ,τ i
k) ≥ ¯δ} =1 −Fδi(¯δ,τ,τ i
k) that the ac-
tual deformation is greater than the threshold¯δ, as represented by
the gray area in Fig. 2. Therefore, the deadline for maintenance
intervention, i.e., the time instant at which the maximum defor-
mation is reached, can be computed by considering a maximum
threshold of such a probability. To this end, let Ti
¯δ be a random
variable representing the time instant at which the deformation
of the rail stretch i reaches the threshold ¯δ, i.e.,
¯δ = δi(τi
k)exp(αiTi
¯δ)+ ϵ. (2)
By means of a simple manipulation, (2) becomes
Ti
¯δ = g(ϵ)= 1
αi
ln
¯δ −ϵ
δi(τi
k) (3)
which is deﬁned if the argument of the logarithm is positive.
This assumption is reasonable since, thanks to Chebyshev’s
inequality Pr{¯δ −ϵ≤ 0}≤σ 2/¯δ2, the probability that ϵ≥ ¯δ
turns out to be negligible for realistic values of σ2 and ¯δ.I n
other words, (3) requires that the model uncertainty ϵbe small
with respect to the maximum admissible ¯δ, although it can be
not negligible in general.
Fig. 3. Shape of the pdf in (5) with ¯δ =1 1 mm and α =0 .01days−1.
Since the function g(ϵ) in (3) is continuous and decreases
monotonically, the cumulative distribution function (cdf) of Ti
¯δ
can be deﬁned as
FTi
¯δ
(τ)=P r{Ti
¯δ ≤ τ} =P r
{ 1
αi
ln
( ¯δ −ϵ
δi(τi
k)
)
≤ τ
}
=P r
{
ϵ≥ ¯δ −δi(τi
k)exp(αiτ)
}
=1 −Fϵ
(¯δ −δi(τi
k)exp(αiτ)
)
(4)
where Fϵ(·) is the cdf of the Gaussian random variable ϵ.
Therefore, the relevant probability density function (pdf) is
fTi
¯δ
(τ)=
dFTi
¯δ (τ )
dτ = αiδi(τi
k)exp(αiτ)√
2πσ2
·exp
(
−
(¯δ −δi(τi
k)exp(αiτ)
)2
2σ2
)
(5)
whose shape is reported in Fig. 3, where it is possible to note its
heavy right tail. The pdf in (5) allows to determine the median,
which, thanks to the symmetry of the Gaussian pdf of ϵ, always
coincides with the instant ¯τi =1 /αi ln(¯δ/δi(τi
k)) at which the
expectation of δi(τi
k,τ ) reaches the threshold ¯δ. Note that ¯τi
is always greater 1 than the expectation E[T¯δi], meaning that
1Such a property can be easily proven by applying the Jensen’s inequality to
the random variable Ti
¯δ = g(ϵ).
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 5 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
CONSILVIO et al.: RH APPROACH FOR PREDICTIVE MAINTENANCE PLANNING TO REDUCE THE RISK 5
neglecting the uncertainty ϵin (1) leads to underestimation of
the failure probability.
Then, let ϕi be the failure event of the rail stretch i and
¯Ri be the maximum tolerable value for the failure risk Ri =
Pr{ϕi}Di(ϕi). Assuming that the loss Di(ϕi) is known, the
maximum failure probability is ¯Pr{ϕi} = ¯Ri/Di(ϕi).
Therefore, the model allows to evaluate the hard deadline
τi
H for the maintenance activity on the rail stretch i consisting
of the instant at which FTi
¯δ
(t) ≥ ¯Pr{ϕi}. Analogously, the soft
deadline is deﬁned as the time instant τi
S at which FTi
¯δ
(t) ≥
γS ¯Pr{ϕi}, γS < 1. The soft deadlines should be respected, al-
though not in a mandatory way, to minimize the failure probabil-
ity even if the threshold¯Pr{ϕi} is always guaranteed. Therefore,
the soft threshold allows to consider the failure probability not
only as a constraint but also as a term to be further minimized.
The same approach can be applied to compute the release
time, which is deﬁned as the time instant τi
R at which, given the
degradation process, FTi
¯δ
(t) ≥ γR ¯Pr{ϕi},γR <γ S , i.e., when
the failure probability of a generic rail stretch i becomes non-
negligible. By iteratively updating theserelease times, the subset
A⊆R of rail stretches, whose maintenance has to be scheduled,
can be identiﬁed. More details about the iterative deﬁnition of
the set A will be provided in Section IV.
In the case-study section, the customization of the abovemen-
tioned model will be discussed with reference to the European
Standards [43]–[45] and the Swedish National Railway Regu-
lation [46], which specify safety-related limits for each track
geometry parameter.
IV . ROLLING-HORIZON FRAMEWORK
In this article, a RH approach is considered
r to introduce certain dynamics into maintenance planning;
r to reduce the computational effort.
With reference to the ﬁrst bullet point, the RH framework
allows to reconsider, in any time window, non-executed activ-
ities from the previous window, due, for example, to delays,
and to introduce new assets whose degradation has reached a
nonforecast unacceptable degradation state.
With respect to the second bullet, scheduling the mainte-
nance activities for all the rail stretches in R may result in a
very difﬁcult task due to the huge computational complexity
of scheduling, which is well known to be a non-deterministic
polynomial-time NP-hard problem. Therefore, within the RH
framework, the set of rail stretches considered at any generic
instant th is signiﬁcantly reduced to the subset A = {i ∈R :
th ≤ τi
R < Δt} of the rail stretches that will require mainte-
nance activities within a certain, ap r i o r i–deﬁned horizon Δt.
As a consequence, the maintenance planning of the complete
set R of rail stretches can be divided into a set of repeatedly
solved sub-problems. In this vein, if the time needed for the
problem solution is Tmax, the optimization problem is stated
in th −Tmax. This parameter can be chosen according to the
available computational resources for the problem solution.
In addition, in the proposed RH approach, the solution is
applied only to the maintenance activities with a completion
Fig. 4. Example of the rolling-horizon framework. Dark colors indicate
scheduled and executed maintenance activities; light colors represent scheduled
activities to be reconsidered in the next optimization problem.
time within the interval 2 [th,th +δt[, where δt is a parameter
that deﬁnes the time interval of the ﬁxed maintenance plan.
This choice has the advantage of allowing for planning of the
activities in the hth RH frame while taking into account at least
part of the activities that will be considered in the (h+1) th
frame, thus leaving a certain degree of freedom for the latter
activities, which can, then, be rediscussed. Therefore, while
a maintenance plan of length δt is actually applied, a rolling
horizonΔt>δ t is planned with the aims of:
1) possibly bringing forward some activities into frame h
if other required maintenance activities are ﬁnished in
advance;
2) possibly postponing some activities to the next frame h+
1 to execute activities on assets located in nearby positions;
3) optimizing the scheduling of the nonexecuted activities of
frameh due to unexpected failures or updated information
on asset status within the plan of frame h+1 .
High values of Δt imply high ﬂexibility, in particular with
reference to 1) and 2), but also a high computational effort, due
to the larger dimension of the sub-problem instances. The choice
of the parametersΔt andδt depends on the allowed operational
ﬂexibility since it implies how often a solution can be rediscussed
and the updated plan provided to maintenance operators. In the
performed experiments, a value Δt ≈ 1.5δt has been proven to
be a good compromise.
An example of two generic subsequent RH frames is reported
in Fig. 4, where the maintenance activities of rail stretches 3 and
6 are planned in the interval [th +δt,th +Δt[ and then consid-
ered in the next frame, when they are scheduled and executed.
Analogously, the maintenance activities of rail stretches 8 and
10 are scheduled but not executed in the (h+1) th RH frame.
V. M AINTENANCE SCHEDULING MODEL
This section describes the mixed integer linear programming
(MILP) model. The relevant notation is reported in Table II.
In this section, to simplify the problem notation, the reference
to RH interval [th,th +δt[ is dropped. In other words, all the
considered sub-problems are written imposing th =0 ,∀h.T h i s
corresponds to a leftward translation of the deadlines by the
quantity th on the time axis, which does not affect the charac-
teristics of the solution: the new deadlines are ˆτH = τH −th,
and ˆτS = τS −th, which can be interpreted as the remaining
2The notation [th,th +δt[ of the hth RH frame indicates a left-closed/right-
open interval, i.e., that the instant th +δt belongs to the (h +1 )th RH frame.
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 6 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
6 IEEE TRANSACTIONS ON RELIABILITY
TABLE II
ADDITIONAL NOTATION FOR THE CONSIDERED MILP PROBLEM
Fig. 5. Correspondence between the solution of each sub-problem and the
complete maintenance problem.
time until the deadlines at the beginning of the hth frame.
Similarly, once the optimization problem is solved, the optimal
maintenance starting times ˆtm,⋆
i and completion times ˆcm,⋆
i are
translated to the right of the quantityth, that is,tm,⋆
i = th +ˆtm,⋆
i
andcm,⋆
i = th +ˆcm,⋆
i , respectively. A sketch showing the rela-
tions between the relative and absolute times is depicted in Fig. 5.
A. Assumptions
In the formulation of the MILP problem, the following as-
sumptions have been considered to model real-world operational
aspects.
1) Any interval [th,th +Δt[, h =0 ,1,... , can be divided
into (discontinuous) train-free subintervals, gathered in
the set T , during which train circulation is forbidden and
maintenance activities can be performed.
2) Preemption of maintenance activities is not allowed.
3) All maintenance teams are available at the initial time.
4) All maintenance teams are unrelated, and each mainte-
nance activity can be processed by any free team.
5) To allow for normal circulation outside train-free intervals,
the tamping machines must be able to reach the nearest
parking rail at the end of the last maintenance activity
in each train-free interval. Fig. 6 shows the assignment
of the parking slots to the different segments of the rail
line. Therefore, the setup time is different depending on
whether the consecutive activities on the rail stretchesi and
j are executed in the same interval r or not. In particular,
the setup time is composed of the travel time from the
location of the rail stretch i to the location of rail stretch
j if they are maintained in the same interval; on the other
hand, if the activity ofj is performed in the intervalr +1 ,
the setup time consists of the travel time from the tamping
machine parking slot i⋆nearest to i (usually consisting of
a secondary rail in a station).
These assumptions are representative of the considered main-
tenance process consisting of tamping activities along a rail line.
Nevertheless, Assumptions 3 and 4 can be easily removed by
modifying the related problem constraints.
B. MILP F ormulation
This section introduces and describes the optimization prob-
lem for the maintenance of a set of assets distributed along
a railway line. Thanks to the previously described translation
scheme, the proposed formulation is valid for all frames h ∈H .
The problem structure refers to the single-line version proposed
in [1] since the focus of the present work is on the dynamics of
railway maintenance. A single instance of the problem is recon-
sidered in each time slot h ∈H making up the RH framework.
However, the problem in [1] can be used in place of the one
described in this section to easily switch to the network problem.
In addition, a new characteristic of the present problem consists
of the introduction of a particular constraint aimed at taking
into account the time needed by the tamping machine to reach
a parking slot. Before the problem is described, two dummy
activities i =0 and j = |A|+1 are artiﬁcially introduced to
correctly identify the ﬁrst and last real activities.
Any instance of the considered scheduling problem turns out
to be
Y⋆=a r gm i n
Y
J(Y) (6)
J(Y)= λc
|M|∑
m=1
|A|∑
i=1
ωiˆcm
i + λq
|A|∑
i=1
qi (7)
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 7 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
CONSILVIO et al.: RH APPROACH FOR PREDICTIVE MAINTENANCE PLANNING TO REDUCE THE RISK 7
Fig. 6. Scheme of the |R| rail stretches and of the k tamping machine parking slots of the considered line. All rail stretches with the same color have the same
nearest parking slot. An indication of the setup times is also reported, highlighting the difference between the cases in which j followsi in the same time window
and in which i andj are performed in different time frames.
subject to
ˆcm
i = ˆtm
i +
|A|+1∑
j=1
πm
i xm
i,j ∀i ∈A ,∀m ∈M (8)
ˆcm
i ≤ ˆτi
H ∀i ∈A ,∀m ∈M (9)
qi =m a x{0,ˆcm
i − ˆτS
i}∀ i ∈A ,∀m ∈M (10)
ηm
i,j =
|T |∑
r=1
sm
i,jωr
i ωr
j +sm
i⋆,j(1−ωr
i )ωr
j
∀m ∈M ,
{
i =0 ,..., |A|
j =1 ,..., |A|+1 (11)
ˆtm
j ≥ max{ˆcm
i ,Irwj,r}+ηm
i,j −M(1−xm
i,j)
∀r ∈T ,∀m ∈M ,
{
i =0 ,..., |A|
j =1 ,..., |A|+1 (12)
ˆcm
i ≤ Ir +𝓁r −ϑi,i⋆ +M(1−wr
i )
∀i ∈A ,∀r ∈T ,∀m ∈M (13)
|A|+1∑
j=1
xm
0,j ≤ 1, ∀m ∈M (14)
|M|∑
m=1
|A|∑
i=0,i⁄=j
xm
i,j =1 ,j ∈A (15)
|M|∑
m=1
|A|+1∑
j=1,j⁄=i
xm
i,j =1 ,i ∈A (16)
|A|+1∑
k=1,h⁄=j
xm
j,k −
|A|∑
k=0,h⁄=j
xm
k,j =0 ,
∀j ∈A ,∀m ∈M (17)
|T |∑
r=1
wr
i =1 , ∀i =0 ,1,...,|A| +1 (18)
ˆtm
i ,ˆcm
i ,qi ∈ R≥0, ∀i ∈A ,∀m ∈M (19)
ηm
i,j ∈ R≥0, ∀m ∈M ,
i =0 ,..., |A|,j =1 ,..., |A|+1 (20)
xm
i,j ∈{ 0,1}, ∀m ∈M ,
∀i =0 ,..., |A|,∀j =1 ,..., |A|+1,i ⁄=j (21)
where:
r the cost function in (7) consists of the weighted sum of the
tardiness with respect to the soft deadlines and the total
completion time;
r the constraints in (8) deﬁne the completion times of the
maintenance activities. If asset i is assigned to team m,
these constraints, together with the cost function, set all
completion times ˆck
i =0 , ∀k ⁄=m;
r the constraints in (9) guarantee that the maintenance ac-
tivity on each asset i is completed before the relevant hard
deadline;
r the constraints in (10) deﬁne the tardiness of the mainte-
nance activities with respect to the soft deadline;
r the constraints in (11) deﬁne the setup time 3, which is
different if the maintenance activities are executed by
maintenance team m in two different train-free intervals,
as described in assumption 5;
r the constraints in (12) guarantee that if the activity on asset
j is performed soon after the activity on asset i,i ts t a r t s
after the completion of i; at the same time, they guarantee
that if the activity on j is the ﬁrst of the train-free interval
h, it starts after the beginning of that interval;
r the constraints in (13) guarantee that all maintenance
activities ﬁnish within the train-free subinterval, leaving
enough time to reach the nearest parking slot; while these
constraints apply to all activities in a train-free interval,
the one associated with the last activity dominates all the
others;
r the constraints in (14) guarantee that at most one activity
is scheduled as the ﬁrst work of each maintenance team;
r the constraints in (15) and (16) guarantee that every
maintenance activity has exactly one predecessor and
one successor (also considering the dummy activities),
respectively;
r the constraints in (17) state that a predecessor/successor
pair of activities has to be assigned to the same maintenance
team m;
3Such constraints can be linearized since the multiplication z = x·y of two
binary variables x andy is equivalent to the two constraints
{
z ≥ x +y − 1
z ≤ 0.5(x +y)
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 8 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
8 IEEE TRANSACTIONS ON RELIABILITY
Algorithm 1: MA THeuristic Solution Algorithm.
u ← 0
T ← 0
whileT ≤ Tmax do
randomly choose ˜Yu ⊂Y u and let Yﬁx = Yu \ ˜Yu
˜Yu,⋆← argmin
˜Yu
J(˜Yu ∪Y ﬁx)
T ← T +Tu
ifJ(˜Yu,⋆∪Y ﬁx) <J (Yu) then
Yu+1 ← ˜Yu,⋆∪Y ﬁx
else
Yu+1 ←Y u
end if
u ← u+1
end while
r the constraints in (18) guarantee that each activity is only
performed in one and only one train-free subinterval;
r the constraints in (19)–(21) deﬁne the problem variables.
The weights λc and λq in (7) are chosen by the maintenance
service provider in line with the strategic goals of its organization
(more importance attributed to minimization of the completion
time or to minimization of tardiness with respect to the soft
deadline). Regardless, this choice cannot affect the safety level
of the system performance since the constraints in (9) guarantee
that the hard deadlines are always met. If the maintenance service
provider gives a low value to the weight λc, making fulﬁllment
of the soft deadlines negligible in the cost function, the assets
remain in an acceptably degraded condition. Moreover, the
obtained experimental results are quite insensitive to the weights
λc andλq , as a variation of the cost function of 10% was obtained
by varying the weights by 50%.
C. Problem Solution
The problem deﬁned by (6)–(21) is NP-hard; therefore, it is
characterized by a very high computational effort and requires
the deﬁnition of effective heuristic strategies to be solved. In this
article, a MATHeuristic approach is considered.
The development of the solution algorithm is outside the scope
of this article; nevertheless, some information is provided. The
algorithm is based on an iterative approach, which provides new
solutions by performing successive optimizations of a reduced
subset of randomly chosen variables. The considered algorithm
is reported in Algorithm 1, while the relevant notation is de-
ﬁned in Table III. The advantage of the hybrid MATHeuristic
approach is the possibility of combining the strength of exact
methods with the ﬂexibility of an approximated metaheuristic.
This methodology has been proven to be a very competitive alter-
native to solving large-scale instances of complex optimization
problems [47]. The algorithm starts from an initial admissible
top-to-end solution, consisting of executing the activities on
the assets as sorted along the line while assigning the ﬁrst
|A|/2 activities to the ﬁrst team and the remaining ones to
the second team. The choice of the top-to-end initial solution
is due not only to its simplicity but also to the fact that such
TABLE III
NOTATION OF ALGORITHM 1
Fig. 7. Cost function values over 8 RH frames for the case study described in
Section VI.
a strategy is often applied in the real-world maintenance of
geographically distributed assets. Regarding the performance
of the MATHeuristic technique, the applications of the proposed
approach to the considered case study yield average reductions
of approximately 45% of the cost function with respect to the
reference top-to-end solution.
As reported in Algorithm 1, at the end of each iteration, if
the whole solution improves, the new values of the optimized
variables are accepted; otherwise, they are dropped. Actually,
the solution never worsens, as ˜Yu ∪Yfix is always a feasible
solution; nevertheless, if˜Yu,⋆= ˜Yu, the whole solution does not
improve, as shown in Fig. 7, where the ﬂat shapes indicate that
there are no improvements. The iterative approach is applied
for Tmax hours. As the solution never worsens within an RH
window, the peaks in Fig. 7 represent the transition between RH
frames: since new maintenance activities are considered, the
cost function may be much greater than the optimal value of the
previous period. Finally, since the ﬁnal solution of one RH frame
represents the initial solution for the next one, this initial solution
may be infeasible. This infeasibility is simply overcome by the
MATHeuristic approach by varying the subset of considered
variables. In particular, in the new RH window, if the previous
solution is infeasible, the ﬁrst iterations of theMATHeuristic will
ﬁnd a feasible initial solution for that RH window, while the
successive iterations will optimize the feasible initial solution
by randomly choosing a subset of variables. Therefore, the
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 9 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
CONSILVIO et al.: RH APPROACH FOR PREDICTIVE MAINTENANCE PLANNING TO REDUCE THE RISK 9
Fig. 8. B&B and MATHeuristic results comparison. The reference point
(100%) corresponds to the optimal cost function found via the B&B for an
instance with 15 maintenance activities. Note that the best B&B solution is
certainly not the optimal one, as Algorithm 1 ﬁnds better ones.
process for ﬁnding the initial feasible solution and the process
for improving it are the same.
More details regarding the approach are available in [47]
and [1], where a general framework of the MATHeuristic ap-
proach and an example of its application to railway maintenance
are provided.
Regarding the comparison of the MATHeuristic performance
with respect to that provided by the generic branch and bound
(B&B) approach implemented by the IBM-Ilog Cplex solver, the
outputs are reported in Fig. 8 for different instance dimensions
of the problem. In particular, in this ﬁgure, the relative values
of the cost functions for each solution are depicted, with the
relevant labels being the time required to ﬁnd the solutions.
The generic B&B approach does not ﬁnd the optimal solution
for instances with |A| ≥20 or even a feasible solution for
instances with |A| ≥35, considering a maximum running time
of 48 h. Nevertheless, in less than one hour, the considered
MATHeuristic ﬁnds better solutions.
Moreover, even the lower bound (LB), which is the solution of
a relaxed problem providing an evaluation of the goodness of the
solution, is very hard to ﬁnd; in fact, for instances with|A| ≥20,
the best LBs are far from the best solutions. In addition, for
instances with |A| ≥30, the LB found in the initial instant of
the solution search is not improved.
D. Solution Example
In this section, an example is reported with the aim of ex-
plaining the RH approach in detail. In this regard, for the sake of
clarity, it is assumed that t1 =0 ,δt =1 days and Δt =4 days.
Then, let|A| = {1,3,8,10,12,19,23,26,29,30} be the subset
of rail stretches that need to be considered in the maintenance
plan.
Example 1. Delay of an Activity: In this example, during the
ﬁrst time window, the problem in Section V -B is able to
ﬁnd the optimal solution that assigns the activities M1 =
{3,10;19;12;8} to the ﬁrst team and M2 = {30;23, 26;29;1}
Fig. 9. Maintenance plan generated in (a) t1 and (b) t2. Darker colors in (b)
indicate the maintenance activities executed during the ﬁrst train-free interval.
to the second team. In such sets, the maintenance activities
assigned to different train-free intervals are separated by semi-
colons, and the relevant representation is depicted in Fig. 9,
where the dark gray boxes represent the intervals in which trains
circulate and maintenance activities cannot be performed, while
the black boxes represent the maintenance teams’ travel time.
Finally, the white and light gray boxes represent the mainte-
nance activities assigned to the ﬁrst team and the second team,
respectively. With reference to the RH framework, the dynamic
evolves as follows:
1) at t1, the maintenance teams start their maintenance ac-
tivities, and at the end of the ﬁrst train-free interval, main-
tenance activity 30 is ﬁnished on schedule, while a delay
in activity 3 makes activity 10 impossible to ﬁnish within
the ﬁrst train-free interval. Therefore, that maintenance
activity has to be reconsidered in the problem stated for
the interval (t2,t 2 +Δt);
2) the new schedule to be applied in t2 is M1 =
{3;10,12;26;8} for the ﬁrst team and M2 =
{30;19;23, 29;1} for the second team, where the
bold entries indicate the already-executed maintenance
activities.
The solutions depicted in Fig. 9 show that due to the reschedul-
ing of the activity on rail stretch 10, in the new plan, some
activities previously assigned to one team are then assigned to
the other one, some activities are brought forward, and others are
delayed. Nevertheless, despite some modiﬁcations, the activities
scheduler is able to keep all the maintenance activities within
the ﬁrst four train-free intervals.
Example 2. Unpredicted Urgent Activity: In this example,
unexpected maintenance of rail stretch 25 ⁄∈Ahas to be con-
sidered in the problem stated for the interval (t3,t 3 +Δt).
Compared with the plans M1 = {3;10,12;26;8} and M2 =
{30;19;23, 29;1} found in example 1, the new schedule
is M1 = {3; 10, 12;23;8;1} for the ﬁrst team and M2 =
{30; 19;25;26, 29} for the second one.
In this new plan, depicted in Fig. 10, activities 10, 12, and
19 are correctly executed, and the new unpredicted activity (rail
stretch 25) is scheduled as the ﬁrst activity of team M2 on the
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 10 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
10 IEEE TRANSACTIONS ON RELIABILITY
Fig. 10. Maintenance plan generated in (a) t2 and (b) t3. Darker colors in (b)
indicate the maintenance activities executed during the ﬁrst train-free interval.
third day. To allow for that, the maintenance activity of rail
stretch 26 is now assigned to M2, while the activities on rail
stretches 23 and 1 are assigned toM1. Therefore, due to the new
activity 25, the maintenance activities of stretches 26, 29, and 1
are delayed.
VI. C ASE STUDY
In this section, a case study is presented with the aim of
showing the average performance of the proposed approach in a
real-world scenario. To this end, the considered application con-
sists of dynamic planning of tamping maintenance activities on
a single-track line in Sweden managed by the Swedish Transport
Administration (Traﬁkverket). As mentioned, the considered
rail track is basically a freight line, although some passenger
trains also use the line. The annual trafﬁc volume is between 20
million gross tons (MGTs) and 27 MGTs. The train speed on the
line is in the 80–120 km/h category. The line is composed of a
continuous welded rail of the head-hardened 60E1 rail type, with
concrete sleepers and Pandrol e-clip fasteners. The maximum
allowable axle load on the line section is 30 t. The considered
railway stretch of 200 km is divided into 200 equal segments
of 1 km each. The maintenance activities can be scheduled
only during train-free intervals, that is, from 0 A.M.t o5 A.M.
Hence, a working day consists of ﬁve hours during which the
teams move along the line and perform the activities (tamping
machines can move only when there are no circulating trains).
Two maintenance teams M1 and M2, equipped with the same
single-sleeper tamping machine, are available for maintenance,
each starting its ﬁrst travel from the depot. Before the end
of each train-free interval, each maintenance team reaches the
nearest parking slot. The travel time from the nearest parking
slot (usually consisting of a secondary rail in a station) to the
location of the next asset i is considered at the beginning of the
next train-free interval, as deﬁned in (11) and in Assumption 5 in
Section V. Eight parking slots are considered at kilometers 25,
50, 75, 100, 125, 150, 175, and 200.
Regarding the maintenance performance, the teams’ working
speed is set to 500 m of tamped rail per hour, and the traveling
speed between two rail stretches that have to be maintained is
set to 40 km/h.
As mentioned, the considered degradation model is provided
by Famurewa et al. in [41], [42] and was developed by analyzing
the geometry data collected by measurement cars from 2011 to
2016 in the considered Swedish single-track line. Nevertheless,
for conﬁdentiality reasons, realistic realizations are considered
in each RH frame by randomly extracting the values of the
initial deformationδi(τi
k) and of the coefﬁcientαi from uniform
distributions with upper and lower boundaries as deﬁned in
Famurewa et al. [41], [42]. For the same reason, the variance
value of the error ϵis set to σ2 =0 .15 mm2.
Concerning the deadlines and the release time, in the present
case study, they refer to the European Standards [43] and the
Swedish National Railway Regulation [46], which identify the
safety-related limits for each track geometry parameter, provid-
ing limits for different categories of severity:
1) an alert limit (AL) is deﬁned as the limit that, if ex-
ceeded, triggers the track geometry consideration in reg-
ularly planned maintenance operations. This threshold
customizes the deﬁnition of the release time provided
in Section III, which is deﬁned as the instant at which
the probability of reaching the AL exceeds the value
pR =1 0−8 (equivalent toγR =1 0−3);
2) an intervention limit (IL) refers to the value that, if ex-
ceeded, indicates corrective maintenance must be per-
formed to prevent the immediate action limit from being
reached. This threshold deﬁnes the hard and soft deadlines
that correspond to the abovementioned deﬁned threshold
¯δ. In this regard, the hard and soft deadlines are deﬁned as
the instants at which the probability of reaching the IL ex-
ceeds the values ofpH =1 0−5 andpS =1 0−7 (equivalent
to γS =1 0−2), respectively;
3) an immediate action limit refers to the value that, if ex-
ceeded, requires the imposition of immediate measures,
such as closing the line or reducing the speed, to reduce
the risk to an acceptable level. This threshold should never
be reached by rail deformation and is not considered in the
present work.
Regarding the choice of the probabilitiespR,pH , andpS , their
values are set in analogy to the safety integrity level standard and
in particular the SIL1 failure probability, which is 10−5.
The alert and intervention limits are provided by [46] and are
16 mm and 19 mm, respectively.
To set up the experiments, it is also considered that:
1) activity delays are randomly generated in the simulated
scenario, considering a probability of 10−2;
2) the priority of each rail stretch is initially set to 1, and it
doubles if the activity is not executed in the planned RH
frame and must be reconsidered;
3) unpredicted maintenance activities are randomly intro-
duced with the occurrence rate of 10−2 per RH frame.
A. Results
The monthly maintenance plan is evaluated considering a
rolling window of one week and setting δt =7 days, Δt =1 0
days, and Tmax =1 h.
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 11 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
CONSILVIO et al.: RH APPROACH FOR PREDICTIVE MAINTENANCE PLANNING TO REDUCE THE RISK 11
TABLE IV
RESULTS RELA TED TO30 RUNS OF THE RH MODEL
Regarding the algorithm performance, consider the cost func-
tion values computed for each iteration of the MATHeuristic
algorithm and for all the RH frames depicted in Fig. 7. In that
ﬁgure, each peak represents the transition between two con-
secutive RH frames, (th,th +Δt) and (t(h+1),t (h+1) +Δt).
Therefore, due to the newly introduced maintenance activities
to be scheduled and to the updated problem parameters, the
ﬁrst value of the cost function in each window is much greater
than the optimal value computed in the previous window. As
mentioned in Section V -C, the performance of theMATHeuristic
approach is compared with the basic top-to-end solution and
results in an average reduction of 45% of the relevant cost
function values. As mentioned, this basic top-to-end solution
is considered only in the ﬁrst RH window, as also indicated in
Fig. 7, while the initial solution in the next window is the best
solution from the previous window.
The results of the application of the RH approach to the
considered scenario are reported in Table IV, where the average
values of the main parameters, computed over 30 runs of the
proposed RH model, are indicated.
More speciﬁcally, the results show that the approach allows
for the planning of maintenance interventions while dealing with
the stochastic aspect of the rail deformation process, guarantee-
ing a failure probability of7.5×10−6, lower than the maximum
tolerable probability(−25%). In addition, the delay with respect
to soft deadlines, the fulﬁllment of which is not mandatory,
is low (approximately 2.7 days), with a percentage of delayed
activities of 14% with respect to the total number of processed
activities within the 30 runs (2498). Regarding the RH steps,
within the transition between two rolling frames, the number of
non-executed activities that are postponed to the next RH frame
is on average 0.89, while the infeasible solutions after an RH
transition are 1.21. However, the infeasibility is automatically
overcome by the MATHeuristic approach by varying the subset
variables in the following MATHeuristic iteration, guaranteeing
the feasibility of each RH step.
VII. C ONCLUSION
This article described a rolling-horizon approach for
risk-based maintenance planning in the rail sector. The
proposed methodology was proven to be a suitable tool to
manage the maintenance activities of a large set of assets while
dealing with uncertainty. In particular, the stochastic aspect of
the rail deformation process was considered, starting from the
degradation model deﬁned for a speciﬁc kind of asset, to evaluate
the intervention deadlines that guarantee the desired low failure
risk. The proposed approach is suitable for any other degradation
model capable of providing an evaluation of the fault probability
(or probability that the threshold is exceeded). This study
aimed to advance the shift from a traditional preventive cyclical
approach toward predictive strategies for maintenance planning,
overcoming the static aspect of long-term decision-making by
reﬁning the ofﬂine solution in case of receipt of updated informa-
tion from the ﬁeld or unexpected events. The results of the case
study pointed out the capability of the approach to react to exe-
cution delays or priority changes, achieving good performance
with respect to the basic top-to-end approach often applied in the
maintenance of geographically distributed assets, which consists
of the execution of rail maintenance according to the position of
the rail stretches. Therefore, the proposed approach represents
a useful decision-support system for short-term maintenance
planning, introducing into maintenance decision support
aspects that until now have been managed manually by human
operators. Further studies will take into account the interaction
with decision-support tools for long-term planning that can plan
in advance possible service unavailability if the train-free time
intervals are not long enough; future research will also consider
possible penalties or extra costs for the infrastructure manager
or the maintenance service provider if changes must be made
to the previously deﬁned long-term schedule.
REFERENCES
[1] A. Consilvio, A. Di Febbraro, R. Meo, and N. Sacco, “Risk-based optimal
scheduling of maintenance activities in a railway network,” EURO J.
Transp. Logistics, vol. 8, no. 5, pp. 435–465, 2019.
[2] Asset management overview, principles and terminology, ISO 55000:2014,
International Organization for Standardization, Standard, Geneva,
Switzerland, 2014.
[3] A. Zoeteman and C. Esveld, “State of the art in railway maintenance
management: Planning systems and their application in Europe,” Proc.
IEEE Int. Conf. Syst., Man Cybern., 2004, vol. 5, pp. 4165–4170.
[4] N. Jimenez–Redondo, N. Bosso, L. Zeni, A. Minardo, F. Schubert, F.
Heinicke, and A. Simroth, “Automated and cost effective maintenance
for railway (ACEM–Rail),” Procedia-Social Behavioral Sci., vol. 48,
pp. 1058–1067, 2012.
[5] S. S. Soh, N. H. M. Radzi, and H. Haron, “Review on scheduling techniques
of preventive maintenance activities of railway,” in Proc. 4th Int. Conf.
Comput. Intell., Model. Simul. , 2012, pp. 310–315.
[6] R. Macedo, R. Benmansour, A. Artiba, N. Mladenovi´ c, and D. Uroševi´ c,
“Scheduling preventive railway maintenance activities with resource
constraints,” Electron. Notes Discrete Math. , vol. 58, pp. 215–222,
2017.
[7] S. Khalouli, R. Benmansour, and S. Hanaﬁ, “An Ant Colony algorithm
based on opportunities for scheduling the preventive railway maintenance,”
in Proc. Int. Conf. Control, Decis. In. Technol., Apr. 2016, pp. 594–599.
[8] A. Higgins, “Scheduling of railway track maintenance activities and
crews,” J. Oper . Res. Soc., vol. 49, no. 10, pp. 1026–1033, Oct. 1998.
[9] G. Budai, D. Huisman, and R. Dekker, “Scheduling preventive railway
maintenance activities,” in Proc. IEEE Int. Conf. Syst., Man Cybern., Oct.
2004, vol. 5, pp. 4171–4176.
[10] F. Peng, S. Kang, X. Li, Y . Ouyang, K. Somani, and D. Acharya, “A
heuristic approach to the railroad track maintenance scheduling problem,”
Comput.-Aided Civil Infrastructure Eng., vol. 26, no. 2, pp. 129–145, 2011.
[11] C. Borraz-S ánchez and D. Klabjan, “Strategic Gang scheduling for
railroad maintenance,” CCITT, Center for the Commercialization of In-
novative Transportation Technology Northwestern University, Evanston,
IL, USA, Tech. Rep., 2012. [Online]. Available: https://rosap.ntl.bts.gov/
view/dot/25019
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

## --- PAGE 12 ---

This article has been accepted for inclusion in a future issue of this journal. Content is final as presented, with the exception of pagination.
12 IEEE TRANSACTIONS ON RELIABILITY
[12] M. Dell’Orco, M. Ottomanelli, L. Caggiani, and D. Sassanelli, “New
decision support system for optimization of rail track maintenance plan-
ning based on adaptive neurofuzzy inference system,” Transp. Res. Rec.,
vol. 2043, no. 1, pp. 49–54, 2008.
[13] P . Umiliacchi, D. Lane, F. Romano, and A. SpA, “Predictive maintenance
of railway subsystems using an ontology based modelling approach,” in
Proc. 9th World Conf. Railway Res., 2011, pp. 22–26.
[14] R. Shingler, G. Fadin, and P . Umiliacchi, “From RCM to predictive
maintenance: The InteGRail approach,” inProc. 4th IET Int. Conf. Railway
Condition Monit., 2008, pp. 1–5.
[15] N. Jimenez-Redondo, S. Escriba, F. Benitez, F. Cores, and N. Caceres,
“Towards automated and cost-efﬁcient track maintenance. ﬁnal develop-
ments of the ACEM-Rail project,” in Proc. Transport Res. Arena, 2014,
pp. 1–11.
[16] A. Consilvio, M. Iorani, V . Iovane, M. Sciutto, and G. Sciutto, “Real-time
monitoring of the longitudinal strain of continuous welded rail for safety
improvement,” in Proc. IMechE F , J. Rail Rapid Transit, 2019, pp. 1–10.
[17] S. Sharma, Y . Cui, Q. He, R. Mohammadi, and Z. Li, “Data-driven
optimization of railway maintenance for track geometry,” Transp. Res.
C, Emerg. Technol., vol. 90, pp. 34–58, 2018.
[18] A. Jamshidi et al., “A decision support approach for condition-based
maintenance of rails based on big data analysis,” Transp. Res. C, Emerg.
Technol., vol. 95, pp. 185–206, 2018.
[19] P . C. Lopes Gerum, A. Altay, and M. Baykal-G ürsoy, “Data-driven
predictive maintenance scheduling policies for railways,” Transp. Res. C,
Emerg. Technol., vol. 107, pp. 137–154, 2019.
[20] S. Simson, L. Ferreira, and M. Murray, “Rail track maintenance planning:
An assessment model,”Transp. Res. Rec., J. Transp. Res. Board, vol. 1713,
pp. 29–35, 2000.
[21] M. Burrow, S. Naito, and H. Evdorides, “Network-level railway track
maintenance management model,” Transp. Res. Rec., J. Transp. Res.
Board, vol. 2117, pp. 66–76, 2009.
[22] T. Zhang, J. Andrews, and R. Wang, “Optimal scheduling of track main-
tenance on a railway network,” Quality Rel. Eng. Int. , vol. 29, no. 2,
pp. 285–297, 2013.
[23] I. Soleimanmeigouni, A. Ahmadi, and U. Kumar, “Track geometry degra-
dation and maintenance modelling: A review,” Proc. Institution Mech.
Eng., F , J. Rail Rapid Transit, vol. 232, no. 1, pp. 73–102, 2018.
[24] M. C. Jeong, S.-J. Lee, K. Cha, G. Zi, and J. S. Kong, “Probabilistic model
forecasting for rail wear in Seoul metro based on Bayesian theory,” Eng.
Failure Anal., vol. 96, pp. 202–210, 2019.
[25] J. Carretero et al., “Applying RCM in large scale systems: A case study
with railway networks,”Rel. Eng. Syst. Safety, vol. 82, no. 3, pp. 257–273,
2003.
[26] U. Bharadwaj, “A risk based approach to maintenance optimisation of
business critical railway structures/equipment,” in Proc. Institution Eng.
Technol. Semin. Appl. New Technologies Railways, 2007, pp. 53–60.
[27] E. Baglietto, A. Consilvio, A. Di Febbraro, F. Papa, and N. Sacco, “A
Bayesian Network approach for the reliability analysis of complex railway
systems,” in Proc. IEEE Int. Conf. Intell. Rail Transp., 2018, pp. 1–6.
[28] A. Consilvio, A. Di Febbraro, and N. Sacco, “A modular model to schedule
predictive railway maintenance operations,” in Proc. Int. Conf. Models
Technol. Intell. Transp. Syst., 2015, pp. 426–433.
[29] Y . F. Wang, Y . F. Zhang, J. Y . H. Fuh, Z. D. Zhou, P . Lou, and L. G.
Xue, “An integrated approach to reactive scheduling subject to machine
breakdown,” inProc. IEEE Int. Conf. Autom. Logistics, 2008, pp. 542–547.
[30] M. Wang, K. Ramamohanarao, and J. Chen, “Dependency-based risk eval-
uation for robust workﬂow scheduling,” in Proc. IEEE 26th Int. Parallel
Distrib. Process. Symp. Workshops Ph.D. F orum, 2012, pp. 2328–2335.
[31] Y . Gao, Y . Ding, and H. Zhang, “Job-shop scheduling considering
rescheduling in uncertain dynamic environment,” in Proc. Int. Conf.
Manag. Sci. Eng., 2009, pp. 380–384.
[32] R. M. Pathan, “Recovery of fault-tolerant real-time scheduling algorithm
for tolerating multiple transient faults,” in Proc. 10th Int. Conf. Comput.
Inf. Technol., Dec. 2007, pp. 1–6.
[33] L. Ma, J. Kang, C. Zhao, and S. Liu, “Modeling the impact of prognostic
errors on CBM effectiveness using discrete-event simulation,” inProc. Int.
Conf. Quality, Rel., Risk, Maintenance, Safety Eng., 2012, pp. 520–525.
[34] S. Narayanaswami and N. Rangaraj, “A MAS architecture for dynamic,
real-time rescheduling and learning applied to railway transportation,”
Expert Syst. Appl., vol. 42, no. 5, pp. 2638–2656, 2015.
[35] L. Meng and X. Zhou, “Simultaneous train rerouting and rescheduling on
an N-track network: A model reformulation with network-based cumu-
lative ﬂow variables,” Transp. Res. B, Methodol., vol. 67, pp. 208–234,
2014.
[36] A. D’Ariano, L. Meng, G. Centulio, and F. Corman, “Integrated stochastic
optimization approaches for tactical scheduling of trains and railway
infrastructure maintenance,” Comput. Ind. Eng., vol. 127, pp. 1315–1335,
2019.
[37] S. V . Aken, N. Bešinovi´ c, and R. M. Goverde, “Designing alternative
railway timetables under infrastructure maintenance possessions,”Transp.
Res. B, Methodol., vol. 98, pp. 224–238, 2017.
[38] M. H. Bin Osman, S. Kaewunruen, and S. Dindar, “Disruption: A new
component in the track inspection schedule,” in Proc. IEEE Int. Conf.
Intell. Rail Transp., Aug. 2016, pp. 249–253.
[39] Z. Su, A. Jamshidi, A. Núñez, S. Baldi, and B. D. Schutter, “Multi-level
condition-based maintenance planning for railway infrastructures – a
scenario-based chance-constrained approach,” Transp. Res. C, Emerg.
Technol., vol. 84, pp. 92–123, 2017.
[40] A. Consilvio, A. Di Febbraro, and N. Sacco, “Stochastic scheduling
approach for predictive risk-based railway maintenance,” in Proc. IEEE
Int. Conf. Intell. Rail Transp. , 2016, pp. 197–203.
[41] S. M. Famurewa, T. Xin, M. Rantatalo, and U. Kumar, “Optimisation
of maintenance track possession time: A tamping case study,” Proc.
Institution Mech. Eng., F , J. Rail Rapid Transit, vol. 229, no. 1, pp. 12–22,
2013.
[42] S. M. Famurewa, U. Juntti, A. Nissen, and U. Kumar, “Augmented util-
isation of possession time: Analysis for track geometry maintenance,”
Proc. Institution Mech. Eng., F , J. Rail Rapid Transit, vol. 230, no. 4,
pp. 1118–1130, 2015.
[43] Railway applications - track - track geometry quality - part 5: Geometric
quality levels - plain line, switches and crossings , EN 13848–5:2017,
European Committee for Standardization, Standard, Brussels, Belgium,
2017.
[44] Railway Applications. Track. Track Geometry Quality. Characterization of
Track Geometry, EN 13848–1:2019, European Committee for Standard-
ization, Standard, Brussels, Belgium, 2019.
[45] Railway Applications - Track - Track Geometry Quality - Part 6:
Characterisation of Track Geometry Quality , EN 13848–6:2014, Eu-
ropean Committee for Standardization, Standard, Brussels, Belgium,
2014.
[46] Traﬁkverket (2014), “Track structure - track quality - requirement during
construction and maintenance,” Traﬁkverket, Standard, 2014.
[47] F. Della Croce, A. Grosso, and F. Salassa, “A matheuristic approach for
the total completion time two-machines permutation ﬂow shop problem,”
in Evolutionary Computation in Combinatorial Optimization,P .M e r za n d
J.-K. Hao, Eds. Berlin, Germany: Springer, 2011, pp. 38–47.
Authorized licensed use limited to: University of Durham. Downloaded on July 27,2020 at 01:22:44 UTC from IEEE Xplore.  Restrictions apply. 

