# Extracted Text: C:\Users\LENOVO\Downloads\papers\rolling horizon.pdf

**Total Pages:** 47

## --- PAGE 1 ---

1
A rolling horizon model for efficient load planning of intermodal trains 
Abstract 
With increasing efforts to make transportation sustainable, many big countries have started 
expanding rail infrastructure to increase the double-stacking of containers, which doubles the 
utilization of trains. However, double-stacking containers on wagons give rise to additional 
operational and safety constraints which must be considered during the load planning of trains 
at each terminal when containers from the storage yard are selected and assigned to loading 
positions on wagons. Due to the complexity of the load planning problem and the limited time 
available to generate a load plan, major train operators in India optimize the loading of only 
one train at a time. This myopic planning negatively affects the utilization of future trains 
undermining the benefits of double-stacking. In this paper, we first formulate a model for 
simultaneous load planning of multiple trains and prove that the problem is NP-complete. Then, 
we propose two new two-stage optimization approaches that first guarantee optimal utilization 
of multiple trains and then improve the solution to maximize profit depending on the available 
computation time for load planning. Experiments are conducted on real-life load planning 
instances and the results show that the proposed approach outperforms the existing approach 
to achieve better utilization and higher profit. 
Keywords: Container train load planning, Double-stack container trains, Indian Railways, 
Intermodal transport, Optimization 
1. Introduction 
Intermodal containers are widely used to unitize cargo and enable the seamless transport of 
cargo as standard units (containers) across multiple modes. Global container traffic, measured 
in terms of TEUs (Twenty-foot equivalent units), has increased from 541 million in 2010 to 
798 million in 2020 [1]. Indian Railways (IR) is the fourth-largest rail network in the world in 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 2 ---

2
terms of route-kilometers [2]. It is also the fourth largest in the world in terms of freight carried 
in tonne-kilometers [3]. In IR, the export-import container volume has increased from 23.29 
million tonnes carried in 2009 to 50.55 million tonnes carried in 2021 [4], [5]. 
Double-stack container trains are gaining more importance with the growing container traffic 
and environmental concerns. These trains double wagon utilization and reduce transportation 
costs, transit time, and CO 2 emissions per container. Although double-stack trains cannot be 
operated in Europe due to a lower vertical clearance along the railway lines, many countries 
such as Australia, Brazil, China, India, and the USA have developed the infrastructure and are 
increasing the operation of these trains. IR invested about INR 800 billion to develop a 
dedicated freight corridor capable of handling longer, heavier double-stack trains [6]. IR has 
set a target to increase the container railway freight share from 21% in 2018 to 43% by 2031 
[7]. Double-stack container trains will play a significant role in achieving this target. These 
trains will not only carry more containers per train but will also reduce the dwell time of 
containers at the terminal. 
Container trains must be fully loaded to engender all the benefits of double-stacking. However, 
when containers are double-stacked on wagons, several additional operational constraints must 
be satisfied to ensure safe transit. Therefore, a container train load planning problem (CTLP) 
is solved to select and assign containers to wagons. The input for CTLP is a set of containers 
from the storage yard chosen by the terminal manager for loading on the next train. In case of 
a large number of containers waiting in the storage yard, the terminal manager decides on a 
cut-off time to shortlist the oldest containers, typically about twice the train capacity. CTLP 
then selects containers from the input and assigns these to feasible loading positions on wagons 
to maximize train utilization. The output of CTLP is a load plan which contains the details of 
selected containers and their wagon loading positions. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 3 ---

3
The IR infrastructure used by single-stack or double-stack trains is the same. Only the variable 
cost incurred by IR increases for operating double-stack trains. Due to the lower marginal cost 
of double-stacking and to better compete with road transport, IR provides a discount on the 
containers loaded in the upper-stack [8]. The rail haulage cost (RHC) of a container is 
proportional to its size (20-ft or 40-ft) and weight, which implies that a heavier container in the 
upper stack will result in a larger discount. Therefore, train operators in India solve CTLP for 
a more generic objective of maximizing profit, which also infers maximizing utilization of the 
train because each loaded container has a profit associated with its haulage. 
CTLP is an operational level problem. The train operators get about 15 to 30 minutes to 
generate a load plan before train loading begins. Due to the time constraint, train operators in 
India always optimize one train at a time [9]. However, the selection of containers for the 
present train can negatively affect the utilization of future trains. To better match the containers 
to loading positions on wagons in order to improve trains' utilization and profit, it is important 
to optimize the load plan of multiple trains simultaneously. Hence, in this paper we focus on 
the simultaneous load planning of multiple trains to maximize trains' utilization and profit. In 
the literature, experiments by [9] show that maximizing profit for just one train is time 
consuming and, in this paper, we prove that CTLP is NP-complete. Hence, we propose two 
new two-stage solution approaches to effectively trade-off between computation time and 
solution quality. 
The paper is organized as follows. The literature on CTLP is discussed in Section 2. In Section 
3, CTLP is described in more detail, and its mathematical model is presented. Complexity proof 
of the model is also derived in Section 3. Two new two-stage optimization approaches are 
proposed in Section 4. In Section 5, the CTLP model and its solution approaches are validated 
through various instances generated using real-life container train load plans. In Section 6, a 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 4 ---

4
post-processing algorithm is proposed for execution of the load plans. In Section 7, the paper 
is concluded, and future research directions are presented. 
2. Intermodal operations and literature review 
Containers are transported over long distances via ships, trains, and trucks. Each transportation 
mode is typically managed by a different operator, such as a shipping line, a container train 
operator, or a drayage operator. To facilitate an efficient transfer of containers between these 
modes, terminal and port operators provide the requisite infrastructure and ancillary services. 
Fig. 1: Intermodal freight operations and associated decision-making problems
Fig. 1 summarizes a typical import process for the containers. Containers arriving on a ship at 
a port are unloaded using cranes and transported to and stored in the storage yard. When a train 
needs to be loaded, containers are retrieved from the storage yard using cranes and placed on 
the trucks. These trucks then move the containers to the rail-side of the terminal near the 
wagons assigned to the containers. Again, cranes are employed to pick up the containers from 
the trucks and load these onto the wagons. The train then departs to its destination, where the 
containers are unloaded and stored in the storage yard until the receiver of the containers sends 
trucks to pick up the containers.
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 5 ---

5
The container train operator is responsible for planning train formation, routing, scheduling, 
and loading, as mentioned in Fig. 1. A comprehensive review of rail yard operations is 
presented by [10], and train routing, scheduling, and shunting problems are discussed by [11] 
and [12]. CTLP is a complex planning problem, and hence, the problems of railroad blocking, 
train routing and scheduling, and container routing are not considered in this paper. 
After CTLP is solved, the generated load plan is shared with the container terminal operator. 
The terminal operator is responsible for locating the containers from the load plan in the storage 
yard, planning container retrieval operations, train loading and unloading operations, cranes 
and trucks scheduling and routing, and storage space allocation of containers, as shown in Fig. 
1. An overview of container terminal operations and accompanying planning problems is 
provided by [13], [14], and [15]. 
Terminal operations planning problems, such as container retrieval problem and yard crane 
scheduling problem are NP-hard, as shown by [16] and [17]. Moreover, we proved that CTLP 
for double-stack trains is NP-complete. As both the terminal operations planning problems and 
CTLP for double-stack trains are complex, terminal operations planning problems are solved 
separately after CTLP. This is because combining the complex terminal operations and load 
planning decisions for double-stack trains will make the combined problem intractable. 
Further, it is more important to solve CTLP optimally than the terminal operations planning 
problems because the savings from loading just one additional container can be up to INR 
50,000. This saving is many times the savings from minimizing crane movements while 
retrieving containers from the storage yard and loading these on wagons of a train [18]. 
Therefore, in this paper, we have focused only on CTLP for simultaneously planning multiple 
trains. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 6 ---

6
Few papers have worked on terminal operations planning for double-stack trains. A new 
synchronous container handling scheme consisting of an automatic guided vehicle with a 
loading and discharge function and a new special flat wagon is presented by [19]. The authors 
conducted a cost-benefit analysis to show that the proposed container handling scheme reduces 
the handling time and operating cost of double-stack trains compared to the traditional handling 
scheme. To improve terminal operations planning, [20] exploited the multiple optimal 
solutions of the CTLP model. The authors considered a given load plan for a double-stack train 
and developed heuristics to modify it, while satisfying CTLP model constraints and without 
changing the optimal utilization, to minimize total cranes' handling time. This time constitutes 
total container retrieval and relocation time in the yard and loading and rehandling time on the 
rail-side of the terminal. 
CTLP for single-stack trains is a relatively simpler problem, and hence its literature considers 
terminal operations planning decisions along with train load planning decisions [21]. A CTLP 
model was formulated and solved by [22] to minimize train length, container rehandling time, 
movement time, and time taken to change the wagon loading pattern. A CTLP model 
considering different container lengths and their weight restrictions on wagons was presented 
by [23]. The objectives of maximizing utilization and minimizing the time taken to change the 
wagon loading pattern and transportation cost for loading were considered. A CTLP model to 
maximize utilization and minimize unproductive operations at the terminal was formulated by 
[24]. The authors proposed three solution approaches and compared them for their suitability 
for practical implementation. A CTLP model to maximize the total priority of loaded containers 
and minimize container rehandling in the yard was proposed and solved by [25]. 
As the focus of this paper is to solve CTLP for double-stack trains, from now on, CTLP refers 
to the CTLP for double-stack container trains. One of the first works to solve CTLP developed 
container-oriented and location-oriented automatic suggestion heuristics to load containers on 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 7 ---

7
wagons [26]. They considered high wagon utilization, low center of gravity, and uniform 
weight distribution along train length as performance measures. Train safety was considered in 
[27], which solved multiple objectives of maximizing TEUs loaded, minimizing maximum 
vertical center of gravity, and weight difference between two 20-ft containers loaded on a 
wagon. A tabu search algorithm and a two-stage heuristic were proposed and compared for 
randomly generated small as well as real-world instances. 
In the US, the train operators assign only one destination per track. This results in lower 
utilization of railcars on a track if sufficient demand for that destination is not available. Lower 
utilization can also result if the available containers violate operational constraints. A model 
specific to US operations was presented by [28] to assign containers to railcars and railcars to 
destinations while allowing the assignment of railcars on a track to multiple destinations, 
increasing the utilization of railcars. Later, to reduce the computation time of solving the model, 
[29] proposed a three-stage solution approach that tightens the lower and upper bounds. 
However, the blocking and shunting practices in the US are not permitted in India. 
To improve the aerodynamic efficiency of the trains, [30] formulated a CTLP model to 
minimize the total adjusted gap length between containers and solved the model in CPLEX. 
Later, the model was extended to include multiple trains and solved using a rolling horizon 
approach [31]. However, [9] argued that the benefits from minimizing aerodynamic resistance 
would be substantial only if there is a significant variation in the container and wagon lengths 
and if train speed is very high. It is noteworthy that over 97% of container rail traffic in India 
consists of 20-ft and 40-ft containers. 
A CTLP model to maximize total profit from train loading while considering operational and 
safety constraints was formulated and solved by [9]. Later, the model was extended by adding 
constraints to reduce container handling at intermediate stops by assigning lower-stack 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 8 ---

8
positions to containers meant for the final train destination [18]. The model was solved 
optimally in CPLEX for multiple instances while planning one train at a time. The author 
implemented their proposed CTLP model for major train operators in India who were using 
manual planning earlier. The author used a parameter in the objective function to reduce the 
negative effects of planning one train at a time. However, the parameter has shortcomings 
which we discuss in this paper. 
The only paper in the literature to consider simultaneous planning of multiple double-stack 
trains is presented by [31]. But their model has a simplified objective function and ignores real-
life safety constraints. This simplification reduces the problem's complexity, and the model can 
be solved within seconds, which makes it easier to apply a rolling horizon approach. However, 
the CTLP model developed in this paper for the simultaneous planning of multiple trains 
considers practical safety and operational constraints. Also, the model has the objective of 
profit maximization, which is more beneficial and complex as profit depends on container 
characteristics and its wagon loading position. 
The major contributions of this paper are as follows. First, we discuss the effects of restricting 
the planning horizon when generating the load plan. We also highlight the shortcoming of the 
approach present in the literature as well as used in practice to counter these effects. Second, 
for the first time in the literature, we prove the computational complexity of CTLP. Third, we 
present the CTLP model for multiple trains and provide two alternative two-stage optimization-
based solution approaches. Fourth, we perform detailed computational experiments for the 
proposed solution approaches under different scenarios generated using real-life container train 
load plan data from a major train operator in India. From the experiments we show that for two 
trains solving CTLP to maximize utilization is much less computationally challenging than 
solving CTLP to maximize profit. We analyze the financial benefits and computational issues 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 9 ---

9
associated with the simultaneous planning of multiple trains. We also present an algorithm to 
improve service quality while executing the load plan. 
3. Container train load planning model
3.1. Problem formulation
This section discusses a mathematical model of CTLP for planning multiple trains 
simultaneously. The input set of containers consists of 20-ft (1 TEU) and 40-ft (2 TEUs) 
containers, referred to as the 20s and 40s. ISO containers of height 8'6" and 9'6" are 
considered. 
IR allows four feasible loading patterns for loading containers on wagons, as shown in Fig. 
2, and each wagon can accommodate at most four TEUs. A wagon loaded in pattern 1 can 
accommodate two 20s in the lower-stack and one 40 in the upper-stack. The height of the 
20s should be the same to balance the upper-stack container. Pattern 2 indicates a wagon 
loaded with a 40 in the lower and the upper-stack. Patterns 3 and 4 are single-stacked 
wagons loaded with two 20s and one 40, respectively. 
Fig. 2: Feasible loading patterns of the 20s and 40s on wagons
Other possible patterns, such as loading a 40 in the lower-stack and two 20s in the upper-
stack, and loading four 20s on a wagon, are not feasible. This infeasibility is because a 40 
in the lower-stack does not have corner castings at its center to secure the 20s above it. 
Also, loading four 20s on a wagon is prohibited by IR due to safety reasons. Moreover, for 
safety, empty wagons and double-stack wagons cannot coexist on a train. Hence, empty 
wagons are not considered in the CTLP model. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 10 ---

10
In this paper, we consider the load planning of trains operating on an identical route 
between a given pair of origin and destination. The set of container lengths, 20-ft and 40-
ft, is denoted by 𝑙 ∈ 𝐿 = {1, 2}. The input sets of containers of 20-ft and 40-ft are denoted 
by 𝐼𝑙. The set of trains to be planned simultaneously is denoted by 𝑇, and the set of all 
wagons on train 𝑡 ∈ 𝑇 is denoted by 𝐾𝑡. 𝑊 
𝑖 and 𝐻𝑖 refers to the weight and height of 
container 𝑖 ∈ 𝐼1 ∪ 𝐼2, respectively. 𝐺 
𝑘𝑡 refers to the payload capacity of wagon 𝑘 on train 𝑡. 
We extend the model presented by [9] and define the binary decision variables as follows: 
𝑥𝑗𝑘𝑡 = 1,  if wagon 𝑘 ∈ 𝐾𝑡 of train 𝑡 ∈ 𝑇 is loaded in pattern 𝑗 ∈ 𝐽 = {1, 2, 3, 4}, else 𝑥𝑗𝑘𝑡 = 0.
𝑦𝑚𝑖𝑘𝑡 = 1, if a 20-ft container 𝑖 ∈ 𝐼1 is assigned to position 𝑚 ∈ {A, B} on wagon 𝑘 ∈ 𝐾𝑡 of 
train 𝑡 ∈ 𝑇, else 𝑦𝑚𝑖𝑘𝑡 = 0.
𝑧𝑚𝑖𝑘𝑡 = 1 if a 40-ft container 𝑖 ∈ 𝐼2 is assigned to position 𝑚 ∈ {C, D} on wagon 𝑘 ∈ 𝐾𝑡 of 
train 𝑡 ∈ 𝑇, else  𝑧𝑚𝑖𝑘𝑡 = 0. 
Constraints:
∑ 
𝑗 ∈ J 𝑥𝑗𝑘𝑡 = 1 ,    ∀ 𝑘, 𝑡 (1)
∑ 
𝑖 ∈ 𝐼1
𝑊 
𝑖 (𝑦𝐴𝑖𝑘𝑡 + 𝑦𝐵𝑖𝑘𝑡 ) + ∑ 
𝑖 ∈ 𝐼2
𝑊 
𝑖 (𝑧𝐶𝑖𝑘𝑡 + 𝑧𝐷𝑖𝑘𝑡 ) ≤  𝐺 
𝑘𝑡 ,    ∀ 𝑘, 𝑡 (2)
∑ 
𝑖 ∈ 𝐼1
𝑦𝑚𝑖𝑘𝑡 ― 𝑥1 𝑘𝑡 ― 𝑥3 𝑘𝑡 = 0 ,  ∀ 𝑘, 𝑡, 𝑚 ∈ {𝐴, 𝐵} (3)
∑ 
𝑖 ∈ 𝐼2
𝑧𝐶𝑖𝑘𝑡 ― 𝑥2 𝑘𝑡 ― 𝑥4 𝑘𝑡 = 0 ,     ∀ 𝑘, 𝑡 (4)
∑ 
𝑖 ∈ 𝐼2
𝑧𝐷𝑖𝑘𝑡 ― 𝑥1 𝑘𝑡 ― 𝑥2 𝑘𝑡 = 0 ,     ∀ 𝑘, 𝑡  (5)
∑𝑡 ∈ 𝑇 ∑ 
𝑘 ∈ Kt  𝑦𝑚𝑖𝑘𝑡 ≤ 1  ,    ∀ 𝑖 ∈ 𝐼1, 𝑚 ∈ {𝐴, 𝐵} (6)
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 11 ---

11
∑𝑡 ∈ 𝑇 ∑ 
𝑘 ∈ Kt  𝑧𝑚𝑖𝑘𝑡 ≤ 1  ,     ∀ 𝑖 ∈ 𝐼2, 𝑚 ∈ {C, D} (7)
∑ 
𝑖 ∈ 𝐼1
𝑊 
𝑖 (𝑦𝐴𝑖𝑘𝑡 + 𝑦𝐵𝑖𝑘𝑡 ) + ∑ 
𝑖 ∈ 𝐼2
𝑊 
𝑖 𝑧𝐶𝑖𝑘𝑡 ≥  ∑ 
𝑖 ∈ 𝐼2
𝑊 
𝑖 𝑧𝐷𝑖𝑘𝑡 
 
 ,  ∀ 𝑘, 𝑡 (8)
∑ 
𝑖 ∈ 𝐼1
𝐻 𝑖 (𝑦𝐴𝑖𝑘𝑡 ― 𝑦𝐵𝑖𝑘𝑡 ) ≥  𝑥1 𝑘𝑡 ― 1 
 ,    ∀ 𝑘, 𝑡 (9)
∑ 
𝑖 ∈ 𝐼1
𝐻 𝑖 (𝑦𝐴𝑖𝑘𝑡 ― 𝑦𝐵𝑖𝑘𝑡 ) ≤  1 ―  𝑥1 𝑘𝑡
 
 ,    ∀ 𝑘, 𝑡 (10)
Constraints (1) ensure that each wagon is loaded in exactly one pattern. Constraints (2) 
establish that the total weight of containers on a wagon is less than its payload capacity. 
Constraints (3) to (5) match the wagon's loading pattern with the containers' loading 
position. Constraints (6) and (7) certify that each container is assigned only one loading 
position on the trains. Constraints (8) establish that the weight of the lower-stack 
container(s) is always greater than or equal to the weight of its corresponding upper-stack 
container. Constraints (9) and (10) ensure that the height of both lower-stack 20s is the 
same. 
At times, container details and their arrival information are known beforehand. When 
planning multiple trains, we consider these containers to be a part of 𝐼𝑙, and then add 
constraints to ensure their assignment to wagons after their arrival. Let 𝐼𝑡1 and 𝐼𝑡2 be the sets 
of 20s and 40s that will arrive between the departure of trains 𝑡 ―1 and 𝑡. 𝐼11 and 𝐼12 are the 
containers available before the first train is loaded. To avoid assigning a container that 
arrives between trains 𝑡 ―1 and 𝑡 to trains scheduled before 𝑡, the following constraints 
(11) and (12) are added to the CTLP model. For all other constraints, the sets 𝐼1 = ⋃𝑇
𝑡=1 𝐼𝑡1 
∑𝑇
𝑑=𝑡+1 ∑ 
𝑖 ∈ 𝐼𝑑1
(𝑦𝐴𝑖𝑘𝑡 + 𝑦𝐵𝑖𝑘𝑡) = 0, ∀ 𝑘 ∈ 𝐾𝑡, 𝑡 < 𝑇        (11)
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 12 ---

12
 and 𝐼2 = ⋃𝑇
𝑡=1 𝐼𝑡2 will be used. 
The objective function for maximizing train utilization: 
Train utilization is modelled as the maximization of total TEUs loaded on the trains, as 
shown by equation (13). 
The objective function for maximizing profit: 
Rail haulage cost (RHC) is a major operating cost that a train operator pays to IR for using 
the rail infrastructure, locomotives, and crew to operate the trains. RHC depends upon 
container characteristics such as its length, weight, and wagon loading position. Profit for 
the train operator is obtained by subtracting the RHC of a container from the revenue 
received from the consignor for transporting the container. Therefore, after maximizing 
utilization, the second important objective of the train operator is to maximize the total 
profit or minimize the total RHC. 
As IR provides a 50% discount on the containers loaded in the upper-stack [8] and RHC 
increases with container weight, the train operator aims to load heavier containers in the 
upper-stack positions. The concept of rearranging containers to maximize profit while 
loading the same set of containers on the train is referred to as position arbitrage. Position 
arbitrage gain refers to the additional profit gained by the train operator by exchanging a 
lighter container in the upper-stack with a heavier container in the lower-stack of a train 
[32]. 
Let 𝑃𝐿
𝑖  and 𝑃𝑈
𝑖  be the profits generated from loading container 𝑖 in the lower and upper-
stack, respectively. The objective function OF2 maximizing profit is mentioned in equation 
∑𝑇
𝑑=𝑡+1 ∑ 
𝑖 ∈ 𝐼𝑑2
(𝑧𝐶𝑖𝑘𝑡 + 𝑧𝐷𝑖𝑘𝑡) = 0, ∀ 𝑘 ∈ 𝐾𝑡, 𝑡 < 𝑇         (12)
OF1 = ∑𝑡 ∈ 𝑇 ∑ 
𝑘 ∈ Kt  (∑ 
𝑖 ∈ 𝐼1
(𝑦𝐴𝑖𝑘𝑡 + 𝑦𝐵𝑖𝑘𝑡) +  ∑ 
𝑖 ∈ 𝐼2
2( 𝑧𝐶𝑖𝑘𝑡 +  𝑧𝐷𝑖𝑘𝑡 )) (13)
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 13 ---

13
(14). Note that OF2 also maximizes train utilization because each loaded container has a 
profit associated with its haulage. 
OF2 =  ∑𝑡 ∈ 𝑇 ∑ 
𝑘 ∈ K𝑡  (∑ 
𝑖 ∈ 𝐼1
𝑃𝐿
𝑖 (𝑦
𝐴
𝑖𝑘𝑡 + 𝑦𝐵𝑖𝑘𝑡) +  ∑ 
𝑖 ∈ 𝐼2
(𝑃𝐿
𝑖  𝑧
𝐶
𝑖𝑘𝑡 + 𝑃𝑈
𝑖  𝑧𝐷𝑖𝑘𝑡) )  (14)
To explain position arbitrage gain, consider the illustrative example in Fig. 3, where two 
trains 𝑇1 and 𝑇2 are scheduled to depart a few hours apart on the same day for the same 
destination. For simplicity, each train consists of only two wagons, and no container is 
added between the train's departure time. 
Fig. 3: Illustrative load plan to explain position and time arbitrage gains
Load plans A and B are generated for one train at a time using objectives OF1 (Eq. 13) and 
OF2 (Eq. 14), respectively, for each train. The total RHC of trains 𝑇1 and 𝑇2 for load plan 
A is INR 502,200, and for load plan B is INR 489,600. In load plan B, to leverage the 
discount on upper-stack containers and maximize the profit of each train 𝑇1 and 𝑇2, heavier 
containers of 25-tonne are placed in the upper-stack as compared to their lower-stack 
positions in load plan A. This rearrangement to exploit position arbitrage gains reduce the 
RHC of each train by INR 6,300. Load plan C is explained towards the end of this section. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 14 ---

14
The current practice of planning one train at a time ignores future container and wagon 
characteristics. This can lead to an optimal load plan which negatively affects future trains' 
utilization. For example, when the input set of containers has a shortage of 40s, loading all 
the 40s on the first train will leave very few or no 40s to be loaded in the upper-stack of the 
next train. As the 20s cannot be loaded in the upper-stack, the utilization of the next train 
is significantly affected. 
For further explanation, consider Fig. 4, where two trains 𝑇1 and 𝑇2 are to be planned. For 
simplicity, each train consists of only two wagons, and no container is added between the 
train's departure time. Load plan A is generated using OF2 as the objective function for 
planning one train at a time. After planning train 𝑇1, the remaining 40s cannot be feasibly 
loaded in the upper-stack of train 𝑇2 (violates constraint (8)), thereby reducing its 
utilization. 
Fig. 4: Load plans illustrating the purpose and shortcomings of parameter 𝛼
To counter this negative effect of planning one train at a time, [9] introduced a parameter 
𝛼 to be added in OF1 and OF2 as follows: 
OF1a =  ∑𝑡 ∈ 𝑇 ∑ 
𝑘 ∈ Kt  (∑ 
𝑖 ∈ 𝐼1
(𝑦𝐴𝑖𝑘𝑡 + 𝑦𝐵𝑖𝑘𝑡) +  ∑ 
𝑖 ∈ 𝐼2
2( 𝛼.𝑧𝐶𝑖𝑘𝑡 +  𝑧𝐷𝑖𝑘𝑡 )) (15) 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 15 ---

15
The purpose of 𝛼 is to discourage the loading of the 40s in the lower-stack without 
compromising the train's utilization so that the 40s can be loaded in the upper-stack of 
future trains. Hence, in OF1a, the 20s will be given a higher preference for lower-stack 
positions compared to the 40s. Similarly, in OF2a, the value of 𝛼 is selected such that upper-
stack 40s gets the highest weightage (as 𝑃𝑈
𝑖 > 𝑃𝐿
𝑖  for all 𝑖 ∈  𝐼2 due to the discount on upper-
stack containers), followed by lower-stack 20s, and then lower-stack 40s. In this way, 𝛼 
ensures double-stacking of the planned train but saves the 40s for better utilization of future 
trains. In Fig. 4, load plan B is generated using OF2a as the objective function for planning 
one train at a time. In load plan B, the 20s are loaded in the lower-stack of train 𝑇1 so that 
more 40s are available to be loaded in the upper-stack of train 𝑇2. 
From the load plan B in Fig. 4, we see that although 𝛼 reduces the effect of myopic load 
planning to some extent, it cannot ensure that the remaining 40s after loading train 𝑇1 can 
be feasibly loaded on train 𝑇2. Hence, simultaneous planning of multiple trains is crucial. 
In Fig. 4, load plan C is generated using OF2a as the objective function while 
simultaneously planning both trains. In load plan C, the utilization of both trains is 100%. 
Another advantage of simultaneously planning multiple trains is that it provides an 
opportunity to further reduce the total RHC of the trains by rearranging containers across 
trains. That is, a lighter container in the upper-stack of one train can be exchanged with a 
heavier container in the lower-stack of another train, thereby decreasing the total RHC of 
the trains. Analogous to position arbitrage, this concept is referred to as time arbitrage as 
it involves multiple trains. Time arbitrage gain is the RHC saved by exchanging suitable 
containers across trains. 
OF2a =  
∑𝑡 ∈ 𝑇 ∑ 
𝑘 ∈ Kt  (∑ 
𝑖 ∈ 𝐼1
𝑃𝐿
𝑖  (𝑦
𝐴
𝑖𝑘𝑡 +   𝑦𝐵𝑖𝑘𝑡) + ∑ 
𝑖 ∈ 𝐼2
(𝛼. 𝑃𝐿
𝑖  𝑧
𝐶
𝑖𝑘𝑡 +   𝑃𝑈
𝑖  𝑧𝐷𝑖𝑘𝑡 ))  (16)
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 16 ---

16
To further understand time arbitrage, refer to the load plan C of Fig. 3, which is generated 
by solving the CTLP model for the two trains 𝑇1 and 𝑇2 simultaneously. The 15-tonne 
container is moved from the lower-stack of train 𝑇2 to the upper-stack of train 𝑇1, thereby 
reducing the total RHC of trains 𝑇1 and 𝑇2 by INR 11,700. 
From the above discussion, it is clear that simultaneously planning multiple trains increases 
trains' utilization and savings in RHC. However, CTLP is a complex problem where the 
computation time increases exponentially with the size of the input. In many train load 
planning instances, CTLP with OF2a (Eq. 16) as the objective function cannot be solved 
optimally, even for two trains of 40-45 wagons each (typical train size in India) in two to 
three hours. The following section discusses the computational complexity of the basic 
CTLP. 
3.2. Complexity proof of CTLP 
The complexity proof is shown for the basic CTLP model, i.e., the additional constraints, 
such as equations 9-12, are not considered here. Also, the proof is presented considering 
the load planning of only one train. We show that CTLP is NP-complete in both cases when 
either utilization or profit is maximized. That is, CTLP is NP-complete whether the profit 
depends on the container loading position on the wagon or not. To prove NP-completeness, 
we define the decision version of CTLP as follows: 
Definition 1 (CTLP): Given a set 𝐼1 of 20-ft containers, a set 𝐼2 of 40-ft containers, a weight 
function 𝑊: 𝐼1 ∪ 𝐼2→ℤ+, a profit function 𝑃: 𝐼1 ∪ 𝐼2→ℤ+, a set 𝐾 of wagons, where 𝐺𝑘 is 
the payload capacity of wagon 𝑘 ∈ 𝐾, and a target profit 𝒫, compute if there exists an 
allocation function 𝑓 :𝐾→2 𝐼1 ∪ 𝐼2 such that for every 𝑘, 𝑘 ∈ 𝐾, we have 
(i)If 𝑘 ≠ 𝑘, then 𝑓(𝑘) ∩ 𝑓(𝑘) =  ∅ (constraints 6 and 7)
(ii)Either 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 17 ---

17
|𝑓(𝑘) ∩ 𝐼1| = 2, |𝑓(𝑘) ∩ 𝐼2| = 1, or 
|𝑓(𝑘) ∩ 𝐼1| = 0, |𝑓(𝑘) ∩ 𝐼2| = 2, or 
|𝑓(𝑘) ∩ 𝐼1| = 2, |𝑓(𝑘) ∩ 𝐼2| = 0, or 
   |𝑓(𝑘) ∩ 𝐼1| = 0, |𝑓(𝑘) ∩ 𝐼2| = 1, or 
   |𝑓(𝑘) ∩ 𝐼1| = 0, |𝑓(𝑘) ∩ 𝐼2| = 0 (constraints 1, 3, 4, 5) 
(iii) ∑𝑖 ∈𝑓(𝑘)  𝑊(𝑖) ≤ 𝐺𝑘, ∀ 𝑘 ∈ 𝐾 (constraint 2) 
(iv) ∑𝑖 ∈𝑓(𝑘) ∩ 𝐼1  𝑊(𝑖) ≥  ∑𝑖 ∈𝑓(𝑘) ∩ 𝐼2  𝑊(𝑖), ∀ 𝑘 ∈ 𝐾 such that |𝑓(𝑘)| = 3 
(constraint 8) 
Can profit be at least 𝒫? That is, ∑𝑖 ∈𝑓(𝑘)  𝑃(𝑖) ≥ 𝒫 
We denote an arbitrary instance of CTLP by (𝐼1, 𝐼2, 𝑊, 𝑃, 𝒢, 𝒫), where 𝒢 is a set containing 
wagon payload capacities of all wagons in 𝐾. 
We show that CTLP is strongly NP-complete by referring to [33] for strongly NP-
completeness. For this, we reduce from Numerical 3-Dimensional Matching (N3DM), 
which is strongly NP-complete. N3DM is defined as follows. 
Definition 2 (N3DM): Three disjoint sets 𝑉, 𝑄, and 𝑅, each containing 𝑛 elements are 
given. An attribute named 'size' is defined for each element 𝑎 ∈ 𝑉 ∪ 𝑄 ∪ 𝑅 such that size 𝑠
(𝑎) ∈ ℤ+. Compute if 𝑉 ∪ 𝑄 ∪ 𝑅 can be partitioned into 𝑛 disjoint sets 𝐴𝑑, 𝑑 ∈ 𝑁, where 
𝑁 = {1, 2, 3,…,𝑛}, such that 
(i) |𝐴𝑑 ∩ 𝑉| = |𝐴𝑑 ∩ 𝑄| = |𝐴𝑑 ∩ 𝑅| = 1,     ∀ 𝑑 ∈ 𝑁 
(ii) ∑𝑎 ∈ 𝐴𝑐 𝑠(𝑎) = ∑𝑏 ∈ 𝐴𝑑 𝑠(𝑏),      ∀ 𝑐, 𝑑 ∈ 𝑁 
We denote an arbitrary instance of N3DM by (𝑉, 𝑄, 𝑅, 𝑠). 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 18 ---

18
Theorem 1. CTLP is strongly NP-complete even if the payload capacity of every wagon is 
the same and the profit from every container is the same (independent of its wagon loading 
position). In particular, no polynomial-time algorithm exists, even if every wagon's payload 
capacity is the same and the number of distinct profits is one unless P = NP. 
Proof: The problem clearly belongs to NP. To show NP-completeness, we exhibit 
polynomial reduction from N3DM. Let (𝑉, 𝑄, 𝑅, 𝑠) be an arbitrary instance of N3DM. Let 
𝐵 =
1
𝑛∑𝑎 ∈ 𝑉∪𝑄∪𝑅 𝑠(𝑎) be the bound representing the sum of sizes of all elements of 
𝑉 ∪ 𝑄 ∪ 𝑅. If 𝐵 is not an integer, then clearly, the N3DM instance is a NO instance. So, let 
us assume without loss of generality that 𝐵 is an integer. We consider an instance (𝐼1, 𝐼2
, 𝑊, 𝑃, 𝒢, 𝒫) of CTLP, such that the relationship between the attributes of CTLP and N3DM 
instance is as follows: 
𝐼2 = {𝑐(𝑣):𝑣 ∈ 𝑉},  𝑊(𝑐(𝑣)) = 2𝑠(𝑣) +4,   ∀ 𝑣 ∈ 𝑉 
𝐼1 = {𝑐(𝑒):𝑒 ∈ 𝑄 ∪ 𝑅},  𝑊(𝑐(𝑞)) = 2𝑠(𝑞) +2,  ∀ 𝑞 ∈ 𝑄; 𝑊(𝑐(𝑟)) = 2𝑠(𝑟) +1,  ∀ 𝑟 ∈ 𝑅  
𝒫 = 3 𝑛 
The profit 𝑃 from each container is 1. The total number of wagons in 𝐾 is 𝑛. The payload 
capacity of each wagon 𝐺𝑘 is (2𝐵 + 7). The instance of CTLP can be constructed in 
polynomial time from the instance of N3DM. We claim that the two instances are 
equivalent. 
In one direction, we assume that the N3DM instance is a YES instance. Let (𝐴𝑑)𝑑 ∈ 𝑁 form 
a valid partition of 𝑉 ∪ 𝑄 ∪ 𝑅. In 𝑘th wagon, if 𝐴𝑑 = {𝑣𝑑, 𝑞𝑑, 𝑟𝑑} ⊂ 𝑉 ∪ 𝑄 ∪ 𝑅, then we put 
the container 𝑐(𝑣𝑑) from 𝐼2, and containers 𝑐(𝑞𝑑) and 𝑐(𝑟𝑑) from 𝐼1. This is a valid 
allocation since we have 𝑊(𝑐(𝑣𝑑)) + 𝑊(𝑐(𝑞𝑑)) +𝑊(𝑐(𝑟𝑑)) = (2𝑠(𝑣𝑑) + 4) +
(2𝑠(𝑞𝑑) + 2) + (2𝑠(𝑟𝑑) + 1) = 2(𝑠(𝑣𝑑) + 𝑠(𝑞𝑑) + 𝑠(𝑟𝑑)) +7 = 2𝐵 + 7. Since each 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 19 ---

19
wagon contains exactly three containers and we have 𝑛 wagons, the total number of 
containers used is 3𝑛( = 𝒫). Hence, the CTLP instance is a YES instance. 
In the other direction, we assume that the CTLP instance is a YES instance. Let 𝑓 :𝑁 → 
2 𝐼1 ∪ 𝐼2 be an allocation which packs 𝒫( = 3𝑛) containers in 𝑛 wagons. Since each wagon 
can carry at most three containers, it must be the case that 𝑓 assigns exactly one container 
from 𝐼2 to each wagon and exactly two containers from 𝐼1 to each wagon. Since the total 
weight of all containers is (2𝑛𝐵 + 7𝑛), each wagon can carry a weight of at most (2𝐵 + 7). 
As all containers are packed, it must be the case that, in the assignment 𝑓, each wagon 
carries (2𝐵 + 7) weight. 
Since (2𝐵 + 7) is an odd integer, each wagon carries exactly one container {𝑐(𝑣): 𝑣 ∈ 𝑉} 
from 𝐼2 in 𝑓, and one container from each of the sets {𝑐(𝑞): 𝑞 ∈ 𝑄} and {𝑐(𝑟): 𝑟 ∈ 𝑅} from 
𝐼1 in 𝑓. We now define a partition (𝐴𝑑)𝑑 ∈ 𝑁 of 𝑉 ∪ 𝑄 ∪ 𝑅 as 𝐴𝑑 = {𝑣𝑑, 𝑞𝑑, 𝑟𝑑}, if the 𝑑th 
wagon carries containers 𝑐(𝑣𝑑), 𝑐(𝑞𝑑), and 𝑐(𝑟𝑑). Since 𝑊(𝑐(𝑣𝑑)) + 𝑊(𝑐(𝑞𝑑)) +𝑊
(𝑐(𝑟𝑑)) = 2𝐵 + 7, we have 𝑠(𝑣𝑑) +𝑠(𝑞𝑑) +𝑠(𝑟𝑑) = 𝐵 for every 𝑑 ∈ 𝑁. Hence, the N3DM 
instance is a YES instance. 
We proved that CTLP is NP-complete when the profit does not depend on the position of 
containers on the wagons. However, it is easy to extend that CTLP remains NP-complete 
if the profit depends on the position. To explain this, suppose a polynomial-time algorithm 
exists for CTLP when the profit depends on the position. Then, we can use this algorithm 
to solve CTLP instances in polynomial-time when the profit does not depend on the 
position by assigning equal profit to all positions. This will contradict our assumption that 
P ≠  NP. In the next section, we propose two new solution approaches to address the trade-
off between computation time and solution quality effectively. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 20 ---

20
4. Solution approaches 
Two objectives of maximizing utilization OF1a (Eq. 15) and profit OF2a (Eq. 16) are 
defined for the CTLP model in Section 3. The objectives OF1a and OF2a are non-
conflicting. That is, the optimal solution of OF2a will always be an optimal solution of 
OF1a, although vice-versa is not true. Therefore, it should be sufficient to optimize OF2a 
to optimize both OF1a and OF2a. However, from the experiments discussed in Section 5.1, 
we know that it is much more challenging computationally to solve CTLP with OF2a than 
to solve CTLP with OF1a for two trains within an acceptable time limit. If an optimal 
solution of OF2a is not obtained, then even OF1a, a more important objective, will also be 
compromised. In practice, the train operators would always want to ensure optimal 
utilization of the trains because it is the most important factor in generating revenue. We 
know that the CTLP model with OF1a is symmetric due to identical wagon payload 
capacities and several feasible container loading arrangements on wagons, which results in 
multiple optima. Therefore, after maximizing utilization, the train operators will then focus 
on maximizing total profit further to the extent possible. Hence, we present two two-stage 
optimization approaches, which first guarantee optimal trains' utilization and then use the 
remaining computation time to maximize profit. 
4.1. Two-stage optimization approach-I 
The TSO-I approach is illustrated in Fig. 5, and its pseudocode is presented in Algorithm 1 
to plan two trains simultaneously. 
Algorithm 1: Pseudocode for TSO-I approach
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 21 ---

21
Input: Input set of containers 𝐼1 and 𝐼2 
Output: Load plans for trains 𝑇1 and 𝑇2, denoted by 𝕃1∗
 and 𝕃2∗
, respectively
1: Execute Stage-1: Solve the CTLP model with OF1a (Eq. 15) as the objective 
function for two trains 𝑇1 and 𝑇2, i.e., 𝑇 = 2 
2: Assign 𝕆∗ ← optimal value of OF1a 
Assign 𝕊∗← optimal solution from Stage-1 
3: Execute Stage-2: Using 𝕊∗ as an initial feasible solution, warm start the CTLP 
model with the objective function OF2a (Eq. 16) and an additional constraint of 
equation (17) and solve it 
4: Assign 𝕃1∗
, 𝕃2∗
← optimal load plans from Stage-2 of 𝑇1 and 𝑇2
Fig. 5: Solution approaches for CTLP 
In Stage-1, CTLP takes 𝐼1 and 𝐼2 as input and the CTLP model with OF1a (Eq. 15) as the 
objective function is solved for the two trains to maximize utilization. The optimal value 
of OF1a and the optimal solution from Stage-1 are denoted by 𝕆∗ and 𝕊∗, respectively. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 22 ---

22
 In Stage-2, the CTLP model with OF2a (Eq. 16) as the objective function and an additional 
constraint, as shown in equation (17), is considered. The constraint in equation (17) ensures 
that at least 𝕆∗ TEUs are loaded on the trains. 
To get faster results, we warm-start Stage-2 with the optimal solution of Stage-1. In other 
words, the optimal solution of Stage-1 becomes the initial feasible solution for Stage-2. The 
CTLP model of Stage-2 is then solved to generate the load plans for the two trains, 𝕃1∗
 and 
𝕃2∗
. 
In Stage-2, although maximizing profit also implies maximum utilization, it is essential to 
add equation (17) in the CTLP model. This is because Stage-2 can take many hours of 
computation time to generate near-optimal results. If sufficient computation time is not 
provided, the Stage-2 solution might have a large optimality gap and might not even be 
able to load the trains optimally. Therefore, equation (17) is added to ensure that every 
feasible solution of Stage-2 is an optimal solution of Stage-1. Suppose the computation 
time does not allow Stage-2 to reach optimality. In that case, we are sure that train 
utilization is not compromised in the solution of Stage-2. 
Often, in practice, only one train is loaded at a time, and in this duration, information about 
new containers or wagons may become available, or some uncertainty about the existing 
containers or wagons can realize, which can make the load plan of the second train sub-
optimal. This uncertainty can be: (1) an update in container information such as container 
weight or departure time, (2) unavailability of a container due to errors in documentation 
or due to misplacement in the yard, (3) an update in the wagon payload capacity information 
of the second train, (4) unavailability of wagons due to faults detected during inspection, 
or (5) the arrival of additional urgent containers. Therefore, even if we can find a maximum 
∑𝑡 ∈ 𝑇 ∑ 
𝑘 ∈ Kt  (∑ 
𝑖 ∈ 𝐼1
(𝑦𝐴𝑖𝑘𝑡 + 𝑦𝐵𝑖𝑘𝑡) +  ∑ 
𝑖 ∈ 𝐼2
2( 𝑧𝐶𝑖𝑘𝑡 +  𝑧𝐷𝑖𝑘𝑡 )) ≥ 𝕆∗ (17)
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 23 ---

23
profit plan for multiple trains, the plan may become sub-optimal after loading the first train 
and has to be reoptimized for future trains. To deal with long computation time and account 
for updated information, a two-stage optimization approach-II (TSO-II) is proposed. 
4.2. Two-stage optimization approach-II 
The TSO-II approach is also illustrated in Fig. 5, and its pseudocode is presented in 
Algorithm 2. 
Algorithm 2: Pseudocode for TSO-II approach 
Input: Input set of containers 𝐼1 and 𝐼2 
Output: Load plans for trains 𝑇1 and 𝑇2, denoted by 𝕃1∗
 and 𝕃2∗
, respectively 
1: Execute Stage-1: Solve the CTLP model with OF1a (Eq. 15) as the objective 
function for two trains 𝑇1 and 𝑇2, i.e., 𝑇 = 2 
2: Assign 𝕆∗ ← optimal value of OF1a 
Assign 𝕊∗← optimal solution from Stage-1 
3: Execute Stage-2: Using 𝕊∗ as an initial feasible solution, warm start the CTLP model 
with an objective function  
OF2a = ∑ 
𝑘 ∈ K1 (∑ 
𝑖 ∈ 𝐼1
𝑃𝐿
𝑖 (𝑦
𝐴
𝑖𝑘1 + 𝑦𝐵𝑖𝑘1) + ∑ 
𝑖 ∈ 𝐼2
(𝛼. 𝑃𝐿
𝑖  𝑧
𝐶
𝑖𝑘1 + 𝑃𝑈
𝑖  𝑧𝐷𝑖𝑘1 ))  for 𝑡 = 1 
so that profit for only train 𝑇1 is maximized. Add an additional constraint on total 
TEUs (Eq. 17) and solve it 
4: Assign 𝕃1∗
, 𝕃2∗
← optimal load plan from Stage-2 of 𝑇1 and 𝑇2 
𝕃1∗
= ℐ11 ∪ ℐ12 (Union of sets of 20s and 40s in 𝕃1∗
) 
5: Update 𝐼𝑙, 𝐾𝑡, and 𝐺 
𝑘𝑡 and add details for the next train 𝑇3 (which becomes 𝑇2, and 
the existing 𝑇2 becomes 𝑇1) 
6: Repeat for the instance (next two trains) - Go to Step 1 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 24 ---

24
Stage-1 of TSO-II is the same as that of TSO-I. That is, the CTLP model with OF1a (Eq. 
15) as the objective function is solved for the two trains. The optimal value of OF1a and 
the optimal solution from Stage-1 are denoted by 𝕆∗ and 𝕊∗, respectively. 
For Stage-2, with the input of sets 𝐼1 and 𝐼2, the CTLP model with OF2a as the objective 
function for 𝑡 = 1 is considered to maximize profit only for the first train. Equation (17) is 
added as a constraint, and the model is solved by warm-starting it with 𝕊∗. The output load 
plan for train 𝑡 = 1 from Stage-2, denoted by 𝕃1∗
, is generated to maximize profit. As 
constraint (17) ensures that every feasible solution from Stage-2 is an optimal solution of 
Stage-1, the output load plan for train 𝑡 = 2 from Stage-2, denoted by 𝕃2∗
, has maximum 
utilization. The set of containers of length 𝑙 that belongs to 𝕃1∗
 is denoted by ℐ1𝑙 , and the 
remaining set of containers in 𝐼𝑙 is denoted by ℐ1
𝑙  (ℐ1𝑙 ∪  ℐ1
𝑙 = 𝐼𝑙). Using TSO-II, the profit 
for the first train can be maximized within the practical time limits without compromising 
the utilization of future trains. 
To implement the TSO-II approach, a rolling horizon framework is employed. In this 
framework, the model is solved for a longer planning horizon (two trains), and then a part 
of the solution is implemented for a shorter horizon called the control horizon (one train). 
As time progresses, new and uncertain information is realized, and the input sets 𝐼𝑙, 𝐾𝑡, and 
𝐺 
𝑘𝑡 are updated at the end of the control horizon. The model is then solved again for the 
next planning horizon. The framework is illustrated in Fig. 6. 
In step-5 of Algorithm-2, Set 𝐼𝑙 is updated by deleting ℐ1𝑙  from it, updating containers in ℐ1
𝑙  
with the latest information and adding containers eligible to be loaded on the next train 𝑇3. 
Also, sets 𝐾𝑡 and 𝐺 
𝑘𝑡 are updated by removing information about train 𝑇1 and adding 
information about train 𝑇3. Now, the next two trains are planned, i.e., train 𝑇2 becomes 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 25 ---

25
train 𝑇1 and train 𝑇3 becomes 𝑇2. To plan these two trains, the TSO-II approach is again 
executed from Step 1. 
Fig. 6: TSO-II in a rolling horizon framework
For clarity of presentation, we refer to the CTLP model with OF1a as CTLP-I and OF2a as 
CTLP-II, respectively. The approach of solving CTLP-I and CTLP-II for simultaneously 
planning multiple trains is called simultaneous optimization-I (SO-I) and simultaneous 
optimization-II (SO-II), respectively. The single-stage optimization (SSO) approach solves 
CTLP-II for one train at a time and is the state-of-the-art approach currently used by train 
operators. In SSO, CTLP-II is solved for the first train with an input of 𝐼𝑙. The remaining 
containers in 𝐼𝑙, which are not loaded on the first train, denoted by ℐ1
𝑙 , are then used as input 
to solve CTLP-II again for the second train. All the solution approaches are summarized in 
Fig. 5. 
The next section demonstrates detailed numerical experiments conducted to validate the 
proposed solution approaches for the CTLP model. Each subsection compares different 
solution approaches and quantifies the benefits of the approaches based on the obtained 
train utilization and RHC savings. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 26 ---

26
5. Numerical Experiments
To assess the performance of different solution approaches for the CTLP model, we 
collected the data of actual container train load plans from two major train operators in 
India. We obtained the data for six origin-destination (OD) pairs on which double-stack 
container trains are operated. The origin terminal of these OD pairs is rake-deficit, i.e., the 
number of containers to be transported is higher than the wagons available for transport. 
Therefore, it is crucial to achieve optimal train utilization at these terminals. Rake-surplus 
terminals have a higher number of wagons than containers to transport. Therefore, many 
wagons on the departing train are not double-stacked at the rake-surplus terminal, making 
it relatively easier to solve CTLP. However, at the same time, it becomes essential to use 
the CTLP model for load planning so as to select heavier upper-stack containers that 
maximize profit. 
The container details consist of the container's weight, height, and length. The weight of 
20s and 40s can vary between 2.5-tonne (empty) to 33-tonne and 4-tonne (empty) to 33-
tonne, respectively. The train details consist of wagon composition and payload capacity. 
In IR, most trains are direct trains with no intermediate handling. Our solution approach 
works well for direct trains as it results in more arbitrage gain opportunities. A typical train 
consists of 40 to 45 wagons. For the experiments, the trains of 40 wagons each are 
considered to perform a detailed analysis within reasonable computation times. The value 
of 𝑃𝐿
𝑖  and 𝑃𝑈
𝑖  are obtained from [8], and the value of 𝛼 is set to be 0.7. 
For brevity and clarity, we present the experiments only for one OD pair in Tables 1, 2, and 
3. For this OD pair, the representative weight distributions for sets of about 2000 20s and 
2500 40s are shown in Fig. 7. These containers are obtained from the actual load plans of 
about 42 trains. The experiments performed in the following subsections are based on these 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 27 ---

27
actual load plans. It is important to use real-life data for the experiments in order to quantify 
the actual utilization and RHC savings that could have been achieved by using an 
appropriate solution approach. 
 (a) 
(b)
Fig. 7: Typical weight distribution of (a) 40s and (b) 20s in the storage yard
To reduce uncertainty in containers and wagons' information, we conduct the experimental 
analysis considering the simultaneous planning of only two trains. Moreover, for a clear 
comparison and accurate quantification of savings, we do not add new containers after train 
𝑇1 is planned. Therefore, in the experiments, when the TSO-II approach is executed, data 
for train 𝑇3 is not added after train 𝑇1 is planned. 
0
100
200
300
400
500
600
700
0.00%
20.00%
40.00%
60.00%
80.00%
100.00%
6.5 9.5 12.5 15.5 18.5 21.5 24.5 27.5 30.5 33.5
40s weight distribution 
Frequency
Container weight (tonnes) 
0
100
200
300
400
500
600
700
0.00%
20.00%
40.00%
60.00%
80.00%
100.00%
6.5 9.5 12.5 15.5 18.5 21.5 24.5 27.5 30.5
20s weight distribution 
Frequency
Container weight (tonnes) 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 28 ---

28
The scenarios are generated to highlight the effect of different solution approaches for the 
CTLP model on the computation time, optimality gap, train utilization, and RHC savings. 
The experiments are performed using CPLEX v20.1.0 optimization software on a 16-core 
Intel Xeon processor with 32 GB RAM. 
The input data has its origin terminal as a rake-deficit terminal. However, if we consider 
the number of containers in 𝐼𝑙 to be more than the train's loading capacity, then each 
objective function and solution approach can select a different set of containers to be loaded 
on the first train as well as the second train due to multiple optimal solutions. If the set of 
loaded containers changes, the RHC savings from different solution approaches cannot be 
compared. Therefore, we perform the experiments for the worst-case scenario where the 
number of containers in 𝐼𝑙 is equal to the train's loading capacity. Note that if the number 
of containers in 𝐼𝑙 is above the train's capacity, the CTLP model can explore more arbitrage 
gain possibilities which typically results in a decrease in computational time. 
Section 5.A compares the performance of SO-I and SO-II to quantify the arbitrage gain that 
can be obtained while loading the same set of containers on the trains. It also highlights the 
challenges associated with solving SO-II. Section 5.B compares the performance of SO-II 
and TSO-I. Section 5.C compares the performance of SSO, SO-II, and TSO-II. SSO is the 
state-of-the-art approach currently used by train operators. 
All the train instances of Sections 5.A-5.C consider the planning of two trains of 40 wagons 
each. These two trains are scheduled consecutively on the same OD route. The number of 
containers in the input set is equal to the total train's loading capacity of 320 TEUs. For 
comparison, no container is added after the first train is loaded. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 29 ---

29
5.1. Experiments to compare SO-I and SO-II 
Experiments are conducted for 35 train instances, 20 of which are shown in Table 1 for 
brevity. Instances for the experiments vary in the number of 20s and 40s, the total tonnage 
of the input set of 20s and 40s, and the payload capacity of trains, as shown in columns 2 
to 5, respectively. The instances are sorted in increasing order of the payload capacity, and 
for each payload capacity, the instances are again sorted in increasing order of the number 
of 40s. Columns 6 and 7 show the total optimal RHC of trains 𝑇1 and 𝑇2 obtained from SO-
II and SO-I, respectively. Column 8 shows the savings in RHC due to arbitrage gain. 
For the purpose of comparing different solution approaches, optimal utilization, and 
optimal profit are required. However, we found that SO-II typically takes a long 
computation time to give optimal results and may not load the trains completely within the 
desired time limit of about 15 minutes. Therefore, for even comparison, the computation 
time limit is set for two hours, and the optimality gap is set at 0.2%. Columns 9-10 present 
the computational time, and columns 11-12 show the optimality gap for each instance. 
 Table 1: Experiments with SO-I and SO-II for different train instances 
Instance
# 
20s
# 
40s
Total 
tonnage
Payload 
of 𝑇1 
and 𝑇2
Optimal RHC (𝑇1+𝑇2)
(INR)
Savings in 
RHC 
(INR)
Computation 
time (s)
Gap (%)
(tonnes) (tonnes) SO-II SO-I
(SO-I – 
SO-II)
SO-II
SO-
I
SO-
II
SO-
I
1 128 96 4,673 69 4,195,578 4,238,669 43,091 3,612 6 0.00 0
2 128 96 4,823 69 4,329,970 4,376,375 46,405 728 32 0.00 0
3 112 104 4,759 69 4,166,870 4,216,590 49,720 8,438 13 4.40 0
4 96 112 4,686 69 4,050,665 4,087,127 36,462 7,853 11 5.87 0
5 48 136 3,665 69 3,665,574 3,741,812 76,238 7,211 3 5.76 0
6 48 136 4,353 69 3,860,358 3,900,134 39,776 7,201 9 7.05 0
7 144 88 4,591 67 4,124,085 4,150,603 26,518 17 10 0.00 0
8 124 98 4,170 67 3,886,680 3,899,939 13,259 8,397 343 2.26 0
9 124 98 4,462 67 4,026,745 4,086,410 59,665 4,267 9 0.00 0
10 110 105 3,973 67 3,807,503 3,867,168 59,665 7,230 5 2.47 0
11 102 109 4,718 67 4,159,975 4,203,066 43,091 8,417 155 4.81 0
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 30 ---

30
12 96 112 4,108 67 3,839,270 3,898,935 59,665 7,235 6 3.42 0
13 80 120 3,765 67 3,702,062 3,778,300 76,238 7,809 5 4.20 0
14 132 94 4,387 64 4,052,126 4,091,903 39,777 2,465 14 0.00 0
15 122 99 4,708 64 4,165,130 4,188,333 23,203 7,808 39 4.83 0
16 112 104 3,997 64 3,854,589 3,924,197 69,608 391 12 0.00 0
17 108 106 4,488 64 4,021,085 4,067,490 46,405 7,210 16 4.01 0
18 96 112 4,653 64 4,039,108 4,072,255 33,147 7,858 35 3.59 0
19 80 120 4,549 64 4,042,504 4,052,448 9,944 7,206 20 2.45 0
20 64 128 3,858 64 3,681,677 3,734,712 53,035 8,178 4 3.74 0
Both the solution approaches, SO-I and SO-II, are able to load the two trains 𝑇1 and 𝑇2 
completely with 320 TEUs. Column 8 shows the minimum value of RHC savings (position 
and time arbitrage gains) achieved by SO-II in the allotted computation time. This saving 
is minimum because the number of containers in the input set is considered to be the same 
as the train's capacity. If more containers are available, then SO-II can explore more 
arbitrage gain opportunities if it exists. Also, further arbitrage gain can be exploited if more 
computation time is available. Average saving in RHC of INR 48,000 is achieved by using 
SO-II over SO-I due to arbitrage gains. Note that SO-II is able to leverage both time and 
position arbitrage gains. The average computation time that SO-I takes to generate optimal 
train load plans is 28 seconds. Whereas, for most instances, SO-II reaches the 
computational time limit of two hours before an optimal solution is found. From the 
experiments, it can be inferred that SO-II takes a much longer computation time compared 
to SO-I. Within two hours, an average gap of 2.4% and a maximum gap of 7.05% are 
observed for SO-II. A high gap value denotes that many arbitrage gain opportunities may 
be lost due to insufficient run time. 
From the experiments in Table 1, it is clear that for many instances, SO-II is unable to 
achieve an optimal solution within the set computation time limit of two hours. In some 
instances, the experiments take more than ten hours to reach the optimal solution. This 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 31 ---

31
observation is also supported by the complexity proof presented in Section 3.B. To 
overcome this shortcoming of SO-II, TSO-I, and TSO-II are proposed. 
5.2. Experiments to compare SO-II and TSO-I 
The first and second stages of TSO-I are equivalent to SO-I and SO-II, respectively. The 
benefit of using TSO-I over SO-II is that it allows the train operator to maximize profit 
after optimizing utilization. Optimal utilization of the trains can typically be achieved 
within the first ten minutes (column 10 of Table 1). Hence, after ensuring optimal 
utilization, the train operator can use the available computation time to leverage arbitrage 
gains and maximize profit. 
5.3. Experiments to compare SSO, SO-II, and TSO-II 
The three solution approaches, namely SSO, SO-II, and TSO-II, differ in their trade-off 
between the solution quality and computation time. The performance of the three solution 
approaches is compared in terms of utilization and savings in RHC. A computation time of 
two hours and an optimality gap of 0.2% is allowed for each instance, which enables the 
comparison of optimal utilization and RHC savings. 
The experiments for SSO and TSO-II are conducted for the same instances mentioned in 
Table 1, and Table 2 summarizes the results. Column 2 mentions the optimal TEUs loaded 
on the second train 𝑇2 using SSO. Column 3 shows the additional TEUs loaded on train 𝑇2 
using TSO-II. Columns 4 to 6 present the optimal RHC of trains 𝑇1 and 𝑇2 obtained using 
the three solution approaches. Columns 7 to 9 compare savings in the RHC obtained using 
different approaches. 
Column 10 presents the computation time taken to generate the load plan of train 𝑇1 using 
SSO, and columns 11 and 12 illustrate the computation time taken by Stage-1 and 2 of 
TSO-II, respectively. Columns 13 and 14 show the optimality gap for the load plans of 𝑇1 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 32 ---

32
generated by SSO and the second stage of TSO-II, respectively. The computation time and 
gap of only train 𝑇1 are compared because after each train loading, the container and wagon 
information are updated, and the model is solved again for the next two trains. 
The utilization of train 𝑇1 is not shown in Table 2, as it is always fully loaded with 160 
TEUs using both SSO and TSO-II approaches. The utilization of train 𝑇2 using TSO-II is 
160 TEUs for all the instances and hence is not shown in the table. When SSO is used for 
generating the load plan of train 𝑇1, the utilization of second train 𝑇2 is not accounted. 
Therefore, in instances 2, 8, 11, 17, and 18, the utilization of train 𝑇2 from SSO is less than 
the optimal utilization of 160 TEUs from TSO-II, as shown in columns 2 and 3. The 
maximum and average train utilization using SSO is 160 TEUs and 159 TEUs, respectively. 
It is noteworthy here that TSO-II is a better approach than SSO because TSO-II ensures 
optimal utilization of both the trains 𝑇1 and 𝑇2, unlike SSO. 
Table 2: Experiments with SO-II, SSO, and TSO-II for different instances of two trains 
with identical wagon compositions
Instance
# 
TEUs 
loaded
Additional 
TEUs 
loaded by 
TSO-II*
Optimal RHC (𝑇1+𝑇2) 
(INR)
Savings in RHC (INR) Computation time (s) Gap (%)
 SSO SO-II SSO TSO-II
(SSO 
- 
TSO-
II)
(SSO 
- SO-
II)
(TSO-
II - 
SO-
II)
SSO TSO-II SSO TSO-
II
 𝑇2 𝑇2       𝑇1
Stage-1 
(𝑇1+𝑇2
)
Stage-
2 (𝑇1) 𝑇1 𝑇1
1 160 0 4,195,578 4,195,578 4,195,578 0 0 0 2 6 22 0.00 0.00
2 150 10 4,329,970 4,172,730 4,336,599 NA* NA* 6,629 5 32 7,218 0.00 2.59
3 160 0 4,166,870 4,176,814 4,170,184 6,629 9,944 3,315 19 13 65 0.00 0.00
4 160 0 4,050,665 4,050,665 4,050,665 0 0 0 126 11 1,190 0.15 0.15
5 160 0 3,665,574 3,665,574 3,665,574 0 0 0 5 3 20 0.15 0.15
6 160 0 3,860,358 3,860,358 3,860,358 0 0 0 7,200 9 7,202 0.45 1.08
7 160 0 4,124,085 4,124,085 4,124,085 0 0 0 2 10 22 0.00 0.00
8 154 6 3,886,680 3,857,852 3,896,624 NA* NA* 9,944 2 343 1,555 0.00 0.15
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 33 ---

33
9 160 0 4,026,745 4,043,319 4,036,689 6,629 16,574 9,944 2 9 20 0.00 0.00
10 160 0 3,807,503 3,807,503 3,807,503 0 0 0 3 5 11 0.00 0.00
11 158 2 4,159,975 4,144,278 4,163,290 NA* NA* 3,315 7,210 155 7,203 0.60 1.35
12 160 0 3,839,270 3,849,215 3,845,900 3,315 9,944 6,629 2 6 15 0.15 0.00
13 160 0 3,702,062 3,702,062 3,702,062 0 0 0 5 5 8 0.15 0.00
14 160 0 4,052,126 4,052,126 4,052,126 0 0 0 5 14 33 0.00 0.00
15 160 0 4,165,130 4,178,389 4,175,075 3,315 13,259 9,944 2 39 102 0.00 0.00
16 160 0 3,854,589 3,861,218 3,857,903 3,315 6,629 3,315 4 12 23 0.00 0.15
17 156 4 4,021,085 3,944,132 4,021,085 NA* NA* 0 4 16 110 0.00 0.00
18 156 4 4,039,108 3,966,680 4,039,108 NA* NA* 0 54 35 4,091 0.15 0.14
19 160 0 4,042,504 4,042,504 4,042,504 0 0 0 181 20 181 0.18 0.15
20 160 0 3,681,677 3,681,677 3,684,992 -3,315 0 3,315 2 4 16 0.00 0.15
* TSO-II was able to load 160 TEUs on train 𝑇2 for all the instances 
Note: NA* means that the RHC cannot be compared because the utilization of train 𝑇2 from SSO (column 2) is less than that from TSO-II 
The RHC from TSO-II, SO-II, and SSO can only be compared for the instances where SSO 
achieved the same optimal utilization of 160 TEUs. The values in columns 7 and 8 
represented by NA* are for instances 2, 8, 11, 17, and 18, where SSO loaded fewer 
containers on the second train than TSO-II. For these instances, the higher RHC from TSO-
II and SO-II is because it loaded more containers on train 𝑇2 and each loaded container has 
a RHC and profit associated with it. The increased train utilization from using TSO-II over 
SSO is an advantage, as loading more containers per train results in significant savings. 
Note that the savings from increased train utilization are in addition to the savings that can 
be obtained from leveraging additional arbitrage gain opportunities from loading more 
TEUs. This observation highlights the benefit of planning multiple trains simultaneously 
over the current approach of planning one train at a time. 
In column 7, TSO-II has a lower RHC than SSO in all instances, except for instance 20. 
This implies that TSO-II leveraged more position arbitrage gains than SSO and generated 
additional RHC savings of up to INR 6,629. In instance 20, the higher RHC of TSO-II can 
be due to two reasons; (1) the optimality gap for train 𝑇2 using TSO-II is greater than the 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 34 ---

34
acceptable gap of 0.2%, or (2) TSO-II could not leverage at least one position arbitrage 
opportunity because of myopic profit maximization in Stage-2. We emphasize that SSO 
was able to exploit this position arbitrage opportunity only because of multiple optimal 
solutions. 
In column 8, a maximum RHC savings of INR 16,574 has been observed from using SO-
II over SSO. This savings can be attributed to both position and time arbitrage gains 
exploited by SO-II. In column 9, a maximum RHC savings of INR 9,944 has been observed 
from using SO-II over TSO-II. This savings is due to the time arbitrage gain leveraged by 
SO-II. 
In columns 7 to 9, the savings in RHC is zero for many instances. This is because the 
position and time arbitrage gain opportunities are dependent on the weight distribution of 
the 20s and 40s in 𝐼𝑙. In many instances, the weight distribution of containers is such that 
all the approaches are able to exploit all the position and time arbitrage opportunities. 
Hence, the savings in RHC is zero. However, any positive savings in RHC from using TSO-
II and SO-II indicates their capability to exploit additional arbitrage opportunities over 
SSO. 
The computation time taken by SSO and TSO-II to generate the load plan of train 𝑇1 is 
compared for the instances where SSO was able to achieve the same optimal utilization for 
train 𝑇2 as TSO-II. For train 𝑇1, the average computation time taken by SSO is 618 seconds, 
and by the second stage of TSO-II is 689 seconds. TSO-II Stage-1 is exactly the same as 
SO-I and takes an average of 28 seconds. For instances 2, 8, 11, 17, and 18, TSO-II Stage-2 
takes longer because additional computations are required to ensure optimal utilization of 
train 𝑇2. The computation time varies across instances as it depends upon the flexibility to 
assign containers to wagon loading positions, which in turn depends upon the weight 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 35 ---

35
distribution of containers in 𝐼𝑙. For train 𝑇1, both SSO and TSO-II could generate solutions 
close to the optimal solutions and have an average optimality gap of 0.1% and 0.25%, 
respectively. 
In Table 2, both trains 𝑇1 and 𝑇2 have identical wagons with the same payload capacities. 
However, when the two trains have non-identical wagons with different payload capacities, 
it becomes even more crucial to consider the payload of the next train while planning the 
present train in order to optimize utilization and profit. 
For example, if the wagon payload capacity of train 𝑇1 is 69-tonne and 𝑇2 is 62-tonne, 
heavier containers can be loaded on 𝑇1 so that the utilization of 𝑇2 is not compromised. The 
TSO-II approach is effective in dealing with variable payload capacities because it 
prioritizes the utilization of future trains over maximizing profit for the present train.  
Experiments are conducted for 20 instances where the payload capacity of the first train is 
more than the payload capacity of the second train and Table 3 illustrates 14 of these 
instances. 
Table 3: Experiments with SSO and TSO-II for different instances of two trains with non-
identical wagon compositions
Inst
anc
e
# 
20s
# 
40s
Total 
tonnag
e
Payloa
d of 𝑇1
; 𝑇2
# 
TE
Us 
load
ed
Addition
al TEUs 
loaded 
by TSO-
II*
Optimal RHC (𝑇1+𝑇2)
(INR)
Saving
s in 
RHC 
(INR)
Computation time (s) Gap (%)
    (tonne
s)
SS
O SSO TSO-II
(SSO - 
TSO-
II)
SSO TSO-II SSO TSO-
II
     𝑇2 𝑇2    𝑇1
Stage-
1 (𝑇1+ 
𝑇2)
Stage-
2 (𝑇1) 𝑇1 𝑇1
1 128 96 4,673 69; 62 150 10 4,015,813 4,195,578 NA* 2 19 1,305 0.00 0.00
2 96 112 4,686 69; 62 154 6 3,940,716 4,050,665 NA* 126 36 2,858 0.15 0.15
3 48 136 3,665 69; 62 160 0 3,665,574 3,665,574 0 5 6 61 0.15 0.15
4 48 136 4,353 69;62 156 4 3,790,542 3,860,358 NA* 7,200 8 7,203 0.45 1.08
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 36 ---

36
5 128 96 4,459 69;65 160 0 4,049,927 4,039,983 9,944 3 13 8 0.00 0.00
6 128 96 4,691 69;65 160 0 4,192,303 4,192,303 0 2 16 47 0.00 0.00
7 112 104 4,007 69;65 160 0 3,827,365 3,827,365 0 2 4 13 0.00 0.00
8 128 96 4,346 67;62 160 0 4,065,370 4,065,370 0 2 32 47 0.00 0.00
9 110 105 3,973 67;62 160 0 3,807,503 3,810,818 -3,315 2 11 14 0.00 0.00
10 80 120 3,765 67;62 160 0 3,702,062 3,702,062 0 5 8 13 0.15 0.00
11 64 128 4,081 67;62 160 0 3,800,867 3,800,867 0 4 6 50 0.15 0.15
12 144 88 4,591 67;64 160 0 4,127,400 4,124,085 3,315 2 21 20 0.00 0.00
13 124 98 4,170 67;64 152 8 3,842,155 3,899,939 NA* 2 471 94 0.00 0.00
14 96 112 3,937 67;64 160 0 3,729,448 3,729,448 0 2 6 22 0.00 0.00
* TSO-II was able to load 160 TEUs on train 𝑇2 for all the instances 
 Note: NA* means that the RHC cannot be compared because the utilization of train 𝑇2 from SSO (column 2) is less than that from TSO-II
In Table 3, columns 2 to 4 present the details of the instances, and column 5 mentions the 
wagon payload capacities of the two trains. Column 6 indicates the optimal TEUs loaded 
on the second train by SSO. Column 7 mentions the additional TEUs loaded on the second 
train by TSO-II. Columns 8 and 9 show the optimal RHC of trains 𝑇1 and 𝑇2 achieved by 
SSO and TSO-II, respectively. Column 10 compares the two approaches and calculates the 
savings in RHC. Columns 11 to 13 present the computation time, and columns 14 and 15 
present the optimality gap for the generated load plans of train 𝑇1 using SSO and TSO-II, 
respectively. 
Both SSO and TSO-II were able to load train 𝑇1 fully, but as expected, SSO yields lower 
utilization of train 𝑇2 compared to TSO-II, which loads 𝑇2 with 160 TEUs in all the 
instances. In instance 1, where the difference in the payload capacities of the two trains is 
7-tonne (column 5), SSO could not load 10 TEUs on train 𝑇2 (column 7). This highlights 
the necessity of adopting TSO-II instead of SSO for train operators. Moreover, the 
numerical values in column 10 compare the ability of TSO-II and SSO to exploit position 
arbitrage gains (NA* is used when the utilization from SSO is less than that from TSO-II 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 37 ---

37
for train 𝑇2). From column 10, TSO-II generated a maximum RHC savings of INR 9,944 
as compared to SSO, which indicates that TSO-II not only maximizes utilization but also 
effectively exploits position arbitrage gains. 
For the instances where SSO yields the same optimal utilization of train 𝑇2 as TSO-II, the 
average computation time of SSO for train 𝑇1 is 3 seconds, and for stage-2 of TSO-II is 27 
seconds. For instances 1 to 4, the payload capacities of the first and the second train is 69-
tonne and 62-tonne, respectively. Due to this difference in payload capacities, the 
computation time of TSO-II Stage-2 is more than SSO because additional computations are 
required to ensure optimal utilization of both trains. However, for instances 1 to 4, the time 
taken by TSO-II stage-1 to optimize utilization is within a minute. The optimality gap of 
the two approaches for train 𝑇1 is comparable. 
Based on the experiments, it can be inferred that TSO-II is the recommended approach for 
simultaneously planning multiple trains. All the experiments conducted in this section are 
for a single OD pair. As RHC depends on the distance between the OD, longer distances 
will result in even higher RHC savings. 
6. Execution of load plans 
When multiple trains are planned together, as is the case in TSO-II, some containers that 
arrived earlier are assigned to trains that depart late. This delay can result in customer 
grievances which affect the service quality provided by the train operators. Therefore, the 
train operators prefer to load the containers on a first-come-first-serve basis (FCFS) in order 
to provide timely service to their customers and minimize customer grievances. This FCFS 
requirement also explains that simultaneous optimization of three or more trains cannot be 
implemented, even if we can find an optimal solution for three trains. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 38 ---

38
Although it is not possible to strictly follow FCFS when planning double-stack trains due 
to operational and safety constraints, it is essential to reduce FCFS violations. To enable 
train operators to improve their compliance with FCFS rules, an algorithm, Algorithm-3, is 
proposed. Algorithm-3 reassign containers to wagons based on their arrival time at the 
terminal, while keeping the load plans of trains 𝑇1 and 𝑇2 optimal. The algorithm is 
developed for the general case where the input set of containers for the CTLP model 𝐼𝑙 is 
more than the total loading capacity of trains 𝑇1 and 𝑇2. The algorithm takes the load plans 
of trains 𝑇1 and 𝑇2 generated using the second stage of TSO-II, 𝕃1∗
and 𝕃2∗
, as input. It also 
takes ℐ1𝑙 , ℐ2𝑙 , and ℐ𝑙 as input, where ℐ1𝑙  and ℐ2𝑙  are the sets of containers of length 𝑙 in 𝕃1∗
and 
𝕃2∗
, respectively, and ℐ𝑙 is defined such that ℐ1𝑙 ∪ ℐ𝑙 ∪ ℐ2𝑙 = 𝐼𝑙. 𝕃1∗
and 𝕃2∗
 are then assigned 
to 𝕃1∗
and 𝕃2∗
, which will be updated to reduce FCFS violations. 
Algorithm 3: Execution of load plans 
Input: Load plans 𝕃1∗
, 𝕃2∗
, ℐ1𝑙 , ℐ2𝑙 , ℐ𝑙 
Output: Modified load plans 𝕃1∗
, 𝕃2∗
1: Assign 𝕃1∗
←𝕃1∗
  and 𝕃2∗
←𝕃2∗
 
2: for each container length 𝑙 in 𝐿 do 
3:     for each container 𝑖 in ℐ1𝑙  do 
4:   𝜎 = [ ] 
5:         for each container 𝑖′ in ℐ2𝑙 ∪  ℐ𝑙 do 
6: if 𝔸𝑖 > 𝔸𝑖′ then            // (i.e., 𝑖′ arrived earlier than 𝑖) 
7:     Calculate 𝔸 = 𝔸𝑖 ― 𝔸𝑖′
8:     Append [𝔸, 𝑖′] to 𝜎 
9: end if 
10:   end for 
11:   Sort 𝜎 in decreasing order of the difference in arrival times 𝔸 
12:   for each element 𝑏 in 𝑟𝑎𝑛𝑔𝑒(𝑙𝑒𝑛(𝜎)) do 
13: Assign 𝑖0←𝜎[𝑏][1] 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 39 ---

39
14: if 𝑖0 ∈ ℐ2𝑙  then 
15:               if 𝑖 and 𝑖0 can be swapped without violating CTLP constraints or 
changing optimal profit and utilization for trains 𝑇1 and 𝑇2, 
respectively then 
16:                         Swap containers 𝑖 and 𝑖0, and update 𝕃1∗
and 𝕃2∗
 
17: Break 
18:           end if 
19: else 
20:            if 𝑖 and 𝑖0 can be exchanged without violating CTLP constraints or 
changing optimal profit of train 𝑇1 then 
21:              Exchange container 𝑖 with 𝑖0 and update 𝕃1∗
22:  Delete 𝑖0 from ℐ𝑙 
23:  Add 𝑖 to ℐ𝑙 
24:  Break 
25:                  end if
26:             end if 
27:         end for
28:     end for
29: end for
For containers of each length 𝑙, and for each container 𝑖 in ℐ1𝑙 , the algorithm checks if any 
container 𝑖′ belonging to ℐ2𝑙 ∪  ℐ𝑙 has an earlier arrival time. Let 𝔸𝑖 and 𝔸𝑖′ denote the arrival 
time of 𝑖 and 𝑖′, respectively. A list 𝜎 is defined such that each element of 𝜎 is another list 
containing the difference is arrival times of 𝔸𝑖 and 𝔸𝑖′, denoted by 𝔸 and 𝑖′. Then, for each 
container 𝑖′ in ℐ2𝑙 ∪  ℐ𝑙, if 𝔸𝑖 > 𝔸𝑖′, list [𝔸, 𝑖′] is appended to 𝜎. The elements of 𝜎 are sorted 
in decreasing order of the difference in arrival times 𝔸. For each element of 𝜎, 𝑖0 is assigned 
as 𝜎[𝑏][1]. If 𝑖0 ∈ ℐ2𝑙 , then the feasibility of swapping 𝑖 and 𝑖0 in 𝕃1∗
and 𝕃2∗
 is checked such 
that the swapping does not violate the CTLP constraints or change optimal profit and 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 40 ---

40
utilization for trains 𝑇1 and 𝑇2, respectively. If the swapping is feasible, then the load plans 
𝕃1∗
and 𝕃2∗
 are updated and the algorithm moves to next container in ℐ1𝑙 . 
If 𝑖0 ∈ ℐ𝑙, then the feasibility of exchanging 𝑖 and 𝑖0 is checked such that the exchange does 
not violate CTLP constraints or change optimal profit of train 𝑇1. If the exchange is 
feasible, then the load plan 𝕃1∗
 is updated, 𝑖0 is deleted from ℐ𝑙, 𝑖 is added to ℐ𝑙, and the 
algorithm moves to next container in ℐ1𝑙 . Once all the containers of ℐ1𝑙  are checked for 
swapping with containers that arrived earlier, the modified load plan 𝕃1∗
 is sent to the 
terminal operator for execution. 
7. Conclusions
The purpose of introducing double-stack trains is to handle the growing container traffic 
efficiently. Therefore, it is crucial to maximize train utilization by simultaneously planning 
multiple trains because even one empty slot on a train can cost up to INR 50,000. This cost 
is many times more than the savings from optimizing any of the secondary objectives of 
load planning. 
This paper presents a CTLP model with the objectives of maximizing utilization and profit 
for multiple trains. We prove that the CTLP model is NP-complete and cannot be solved in 
practical time limits for multiple trains. To effectively trade-off between the solution 
quality and computation time, we propose two two-stage optimization approaches (TSO-I 
and TSO-II). These approaches guarantee optimal utilization of the trains in about five to 
ten minutes and then use the remaining time to optimize the profit further. 
We conduct extensive experiments on real-life train load plans to analyze and compare the 
performance of different solution approaches under different scenarios. The results indicate 
that TSO-II performs better than other approaches in terms of achieved utilization, RHC 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 41 ---

41
savings, and computation time taken to generate the load plans. The results also show that 
by planning multiple trains simultaneously, time arbitrage gains can also be exploited along 
with additional position arbitrage gains. 
The TSO-II approach, in most instances, is able to obtain a near-optimal solution for train 
𝑇1. At high-traffic terminals, TSO-II can generate solutions with optimal utilization of 
multiple trains and maximize profit for the first train within a reasonable optimality gap. 
At low-traffic terminals, more time is available for TSO-II to solve the CTLP model 
optimally. 
Heuristics, commonly used for large-scale optimization, are not proposed in this paper as, 
unlike TSO-II, they may not guarantee optimal train utilization. In the future, efficient 
algorithms can be developed based on the TSO-II approach, i.e., first maximizing the train 
utilization and then applying heuristics to maximize the profit further. 
Moreover, in the future, a model can be developed to account for simultaneous train loading 
and unloading operations at the terminal. A more complex hub and spoke network with 
multiple OD pairs can also be considered when planning multiple trains. Integrating 
terminal operations planning with load planning decisions is also a potential future research 
direction. 
Statements and Declarations 
This research did not receive any specific grant from funding agencies in the public, 
commercial, or not-for-profit sectors. The datasets analysed during the current study are 
confidential company data and are not publicly available. 
8. Appendix A: List of notations 
𝐴𝑑 A partitioned set from set  𝑉 ∪ 𝑄 ∪ 𝑅; 𝑑 ∈ 𝑁
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 42 ---

42
𝔸𝑖 Arrival time of container 𝑖 
𝔸 Difference is arrival times of 𝔸𝑖 and 𝔸𝑖′; where 𝑖 ∈ ℐ1𝑙  and 𝑖′ ∈ ℐ2𝑙 ∪  ℐ𝑙 
𝑎 An element of set  𝑉 ∪ 𝑄 ∪ 𝑅
𝐵 Parameter defined as 
1
𝑛∑𝑎 ∈𝑉∪𝑄∪𝑅 𝑠(𝑎) 
𝑐(𝑣) An element of 𝐼2 in instance (𝐼1, 𝐼2, 𝑊, 𝑃, 𝒢, 𝒫) of CTLP;  𝑣 ∈ 𝑉
𝑐(𝑒) An element of 𝐼1 in instance (𝐼1, 𝐼2, 𝑊, 𝑃, 𝒢, 𝒫) of CTLP; where  𝑒 ∈ {𝑄 ∪ 𝑅}
𝑓 Allocation function
𝐺 
𝑘𝑡 Payload capacity of wagon 𝑘 on train 𝑡 
𝒢 Set of wagon payload capacities; elements 𝐺𝑘
𝐻 𝑖 Height of container 𝑖
𝐼𝑙 Input set of containers of length 𝑙; index 𝑖 
𝐼𝑡𝑙
Set of containers of length 𝑙 that arrive between the departure of trains 𝑡 ― 1 and 
𝑡 
ℐ1𝑙 Set of containers of length 𝑙 that belongs to 𝕃1∗
ℐ2𝑙 Set of containers of length 𝑙 that belongs to 𝕃2∗
ℐ1
𝑙 𝐼𝑙\ℐ1𝑙  
ℐ𝑙 𝐼𝑙\ℐ1𝑙 ∪ ℐ2𝑙  
𝐽 Set of wagon loading patterns; index 𝑗 ∈ 𝐽 = {1, 2, 3, 4}
𝐾𝑡 Set of wagons on train 𝑡; index 𝑘 
𝐾 Set of wagons; index 𝑘 
𝐿 Set of container lengths; index 𝑙 ∈ 𝐿 = {1, 2}
𝕃1∗
, 𝕃2∗
Optimal load plans of 𝑇1 and 𝑇2 from Stage-2 of TSO-I and TSO-II 
𝕃1∗
, 𝕃2∗
Modified load plans of 𝑇1 and 𝑇2 after executing Algorithm-3 
𝑀 Set of loading positions on a wagon 𝑚 ∈ 𝑀 = {A, B, C,D}
𝑁 Index set containing 𝑛 elements {1, 2, … 𝑛}
𝕆∗ Optimal utilization from Stage-1 of TSO-I and TSO-II
𝑃𝐿
𝑖 , 𝑃𝑈
𝑖
Profit obtained from loading container 𝑖 in the lower and upper stack, 
respectively 
𝑃 Profit function
𝒫 Target profit 
𝑄 Set containing 𝑛 elements; index 𝑞
𝑅 Set containing 𝑛 elements; index 𝑟
𝕊∗ Optimal solution from Stage-1 of TSO-I and TSO-II
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 43 ---

43
𝑠(𝑎) Size of element 𝑎;  𝑠(𝑎) ∈ ℤ+
𝑇 Set of trains; index 𝑡 
𝑉 Set containing 𝑛 elements; index 𝑣
𝑊 
𝑖 Weight of container 𝑖
𝑊 Weight function 
𝛼 Parameter added to OF1a and OF2a to discourage the loading of 40s in the 
lower-stack positions 
𝜎 List where each element is another list [𝔸, 𝑖′] for each container 𝑖′ in ℐ2𝑙 ∪  ℐ𝑙 
Binary decision variables: 
𝑥𝑗𝑘𝑡 =  1 if wagon 𝑘 ∈ 𝐾𝑡 of train 𝑡 ∈ 𝑇 is loaded in pattern 𝑗 ∈ 𝐽 = {
1, 2, 3, 4}, else 𝑥𝑗𝑘𝑡 = 0 
𝑦𝑚𝑖𝑘𝑡 = 1 if a 20-ft container 𝑖 ∈ 𝐼1 is assigned to position 𝑚 ∈ {A, B} on 
wagon 𝑘 ∈ 𝐾𝑡 of train 𝑡 ∈ 𝑇, else 𝑦𝑚𝑖𝑘𝑡 = 0
𝑧𝑚𝑖𝑘𝑡 = 1 if a 40-ft container 𝑖 ∈ 𝐼2 is assigned to position 𝑚 ∈ {C, D} on 
wagon 𝑘 ∈ 𝐾𝑡 of train 𝑡 ∈ 𝑇, else  𝑧𝑚𝑖𝑘𝑡 = 0
9. References
[1] United Nations Conference on Trade and Development (UNCTAD). Annual container port 
throughput data. New York: United Nations, 2022, Accessed on July 2022, [Online]. 
Available: https://unctadstat.unctad.org/wds/TableViewer/tableView.aspx?ReportId=
13321. 
[2] World Bank, Development Indicators. Rail lines in total route-kms, 2022, Accessed on 
December 5, 2022, [Online]. Available: https://data.worldbank.org/indicator/IS.
RRS.TOTL.KM. 
[3] World Bank, Development Indicators. Railways, goods transported in million ton-kms, 
2022, Accessed on December 5, 2022, [Online]. Available: https://data.worldbank.org/
indicator/IS.RRS.GOOD.MT.K6. 
[4] Indian Railways (IR), 2008-2009 year book of Indian Railways, 2009, Accessed on May 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 44 ---

44
20, 2022, [Online]. Available: https://indianrailways.gov.in/railwayboard/uploads/direc
torate/stat_econ/pdf/Year_Book_English2008-09.pdf. 
[5] Indian Railways (IR), 2020-2021 year book of Indian Railways, 2021, Accessed on May 
20, 2022, [Online]. Available: https://irtpms.indianrailways.gov.in/site/wp-content
/uploads/2022/03/Year-Book-2020-21-English.pdf. 
[6] Dedicated Freight Corridor Corporation of India Limited (DFCCIL), Project funding, 2021, 
Accessed on May 20, 2022, [Online]. Available: https://dfccil.com/Home/Dynemic
Pages?MenuId=78. 
[7] National rail plan (NRP). Ministry of Railways, 2020, Accessed on May 12, 2022, [Online]. 
Available: https://indianrailways.gov.in/NRP-%20Draft%20Final%20Report%20with%
20annexures.pdf. 
[8] Indian Railways (IR), Rates Circular, 2022, Accessed on May 20, 2022, [Online]. 
Available: https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,
304,366,555,765,1892. 
[9] A. Upadhyay, W. Gu, N. Bolia, Optimal loading of double-stack container trains, 
Transportation Research Part E: Logistics and Transportation Review, 107 (2017) 1–22. 
[10] N. Boysen, M. Fliedner, F. Jaehn, E. Pesch, A survey on container processing in railway 
yards, Transportation Science 47 (2013) 312–329. 
[11] R. K. Ahuja, C. B. Cunha, and G. Şahin, Network models in railroad planning and 
scheduling, in Emerging Theory, Methods, and Applications, INFORMS, 2005, pp. 54–
101. 
[12] C. Caballini, S. Fioribello, S. Sacone and S. Siri, "An MILP Optimization Problem for 
Sizing Port Rail Networks and Planning Shunting Operations in Container Terminals," in 
IEEE Transactions on Automation Science and Engineering, vol. 13, no. 4, pp. 1492-1503, 
Oct. 2016.
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 45 ---

45
[13] R. Stahlbock, S. Voß, Operations research at container terminals: a literature update, 
OR Spectrum 30 (1) (2008) 1–52. 
[14] H.J. Carlo, I.F.A. Vis, K.J. Roodbergen, Storage yard operations in container terminals: 
Literature overview, trends, and research directions, European Journal of Operational 
Research 235 (2014) 412–430. 
[15] S. Tanaka and K. Takii, "A Faster Branch-and-Bound Algorithm for the Block 
Relocation Problem," in IEEE Transactions on Automation Science and Engineering, vol. 
13, no. 1, pp. 181-190, Jan. 2016. 
[16] M. Caserta, S. Schwarze, and S. Voß. "A mathematical formulation and complexity 
considerations for the blocks relocation problem." European Journal of Operational 
Research 219, no. 1 (2012): 96-104. 
[17] A. Narasimhan, and U. S. Palekar. "Analysis and algorithms for the transtainer routing 
problem in container port operations." Transportation science 36, no. 1 (2002): 63-78.
[18] A. Upadhyay, Improving intermodal train operations in Indian Railways, INFORMS 
Journal on Applied Analytics, 50 (4) (2020) 213–224. 
[19] Z. Zhao, X. Wang, S. Cheng, W. Liu, and L. Jiang. "A New Synchronous Handling 
Technology of Double Stake Container Trains in Sea-Rail Intermodal Terminals." 
Sustainability 14, no. 18 (2022): 11254.
[20] P. Rathi, and A. Upadhyay. "Container retrieval and wagon assignment planning at 
container rail terminals." Computers & Industrial Engineering 172 (2022): 108626.
[21] H. Heggen, K. Braekers, A. Caris, Optimizing train load planning: Review and decision 
support for train planners, in: Lecture Notes in Computer Science, Springer International 
Publishing, Cham, 2016: pp. 193–208. 
[22] P. Corry, and E. Kozan. "Optimised loading patterns for intermodal trains." OR 
Spectrum 30, no. 4 (2008): 721-750.
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 46 ---

46
[23] F. Bruns, and S. Knust. "Optimized load planning of trains in intermodal 
transportation." OR Spectrum 34, no. 3 (2012): 511-533.
[24] D. Ambrosino, and S. Siri. "Comparison of solution approaches for the train load 
planning problem in seaport terminals." Transportation Research Part E: Logistics and 
Transportation Review 79 (2015): 65-82.
[25] D. Ambrosino, C. Caballini, New solution approaches for the train load planning 
problem, EURO Journal on Transportation and Logistics 8 (3) (2019) 299–325. 
[26] C. T. Jahren, S. S. Rolle, L. E. Spurgeon, R. N. Palmer, R. R. Newman, D. L. Howland, 
Automatic assignment algorithms for loading double-stack railcars, Transportation 
Research Record HS-042 023 (1995). Accessed on May 20, 2022, [Online]. Available: 
https://onlinepubs.trb.org/Onlinepubs/trr/1995/1511/1511-002.pdf. 
[27] M. Lang, J. Przybyla, X. Zhou, Loading containers on double-stack cars: multi-
objective optimization models and solution algorithms for improved safety and reduced 
maintenance cost. Unpublished (2011). 
[28] M. Ng, W.K. Talley, Rail intermodal management at marine container terminals: 
Loading double stack trains, Transportation Research Part C: Emerging Technologies 112 
(2020) 252–259. 
[29] M. Ng, and D. Y. Lin. "Exact Algorithms for Practical Instances of the Railcar 
Loading Problem at Marine Container Terminals." Journal of Advanced Transportation 
2022 (2022).
[30] Y.-C. Lai, C.P.L. Barkan, H. Önal, Optimizing the aerodynamic efficiency of 
intermodal freight trains, Transportation Research Part E: Logistics and Transportation 
Review 44 (5) (2008a) 820–834. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

## --- PAGE 47 ---

47
[31] Y.-C. Lai, Y. Ouyang, C.P.L. Barkan, A rolling horizon model to optimize aerodynamic 
efficiency of intermodal freight trains with uncertainty, Transportation Science 42 (4) 
(2008b) 466–477. 
[32] A. Upadhyay, Pricing anomalies and arbitrage in container transport in India, 
INFORMS Journal on Applied Analytics. 51 (2021) 422–434. 
[33] M. R. Garey, D. S. Johnson, Computers and intractability 174, San Francisco: 
freeman, 1979. 
This preprint research paper has not been peer reviewed. Electronic copy available at: https://ssrn.com/abstract=4891256
Preprint not peer reviewed

