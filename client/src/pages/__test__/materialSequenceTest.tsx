import MaterialSequence from "Components/materialSequence/materialSequence";

const MaterialSequenceChildTest: React.FC<{ className?: string }> = ({
    className,
}) => (
    <div className={className}>
        Hey, I am one of paragraphs. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit. Phasellus faucibus volutpat efficitur. Aenean dapibus
        dolor sit amet urna porttitor, quis blandit dui blandit. Proin porta in
        tellus nec convallis. Donec et lorem vitae nibh cursus faucibus. Nullam
        pharetra turpis felis. Ut tincidunt, ligula eget eleifend mollis, augue
        nibh vehicula neque, quis semper quam ante in ligula. Fusce lacus lorem,
        euismod id lacinia vitae, suscipit nec purus. Morbi non sodales leo, non
        consequat turpis. Vestibulum auctor urna sed massa tincidunt feugiat.
        Nullam vitae dictum ligula. Nullam fermentum nunc ligula, ut posuere
        dolor vestibulum posuere. Donec risus mi, laoreet at orci id, suscipit
        dignissim libero. Fusce gravida, tellus eu ultricies commodo, turpis
        purus aliquam nunc, a feugiat lacus nibh nec ligula. Vivamus eget
        volutpat odio. Donec ac ullamcorper eros, id volutpat sapien. Cras
        pulvinar auctor augue eget placerat. Nullam quam neque, semper eu
        malesuada ut, dignissim quis leo. Aliquam et mi nisl.
    </div>
);
const MaterialSequenceChildTest2: React.FC<{ className?: string }> = ({
    className,
}) => (
    <div className={className}>
        Hey, I am one of paragraphs. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit. Phasellus faucibus volutpat efficitur. Aenean dapibus
        dolor sit amet urna porttitor, quis blandit dui blandit. Proin porta in
        tellus nec convallis. Donec et lorem vitae nibh cursus faucibus. Nullam
        pharetra turpis felis. Ut tincidunt, ligula eget eleifend mollis, augue
        nibh vehicula neque, quis semper quam ante in ligula. Fusce lacus lorem,
        euismod id lacinia vitae, suscipit nec purus. Morbi non sodales leo.
    </div>
);
const childrenArr = Array(3).fill(MaterialSequenceChildTest);
childrenArr[1] = MaterialSequenceChildTest2;

const MaterialSequenceTest: React.FC = () => (
    <div style={{ height: "400px", width: "400px" }}>
        <MaterialSequence border>{childrenArr}</MaterialSequence>
    </div>
);
export default MaterialSequenceTest;
