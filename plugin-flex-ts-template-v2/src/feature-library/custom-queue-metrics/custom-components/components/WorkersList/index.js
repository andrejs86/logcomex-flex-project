import { Container } from './styles';

const WorkersList = ({ workers, title, status, Icon }) => {
  const workerByStatus =
    workers.length > 0 && workers.filter((activityWorker) => activityWorker.activity_name === status);

  return (
    <Container>
      <div className="div-activity-modal custom-activity-modal">
        <Icon />
        <span className="task-state">{title}</span>
      </div>
      {workerByStatus.length > 0 &&
        workerByStatus.map((worker) => {
          const attributes = JSON.parse(worker.attributes);
          const skills = attributes.routing && attributes.routing.skills;

          return (
            <li key={worker.sid} className="only-task">
              <span className="custom-bold-text">{attributes.full_name}</span>
              <p>
                <span className="custom-bold-text">E-mail: </span>
                {attributes.email}
              </p>
              <p>
                <span className="custom-bold-text">Permissões: </span>
                {attributes.roles.toString()}
              </p>
              {skills ? (
                skills <= 0 ? (
                  <p>
                    <span className="custom-bold-text">Skills: </span>
                    <span className="skill-text">Sem skills</span>
                  </p>
                ) : (
                  <p>
                    <span className="custom-bold-text">Skills: </span>
                    {skills.toString()}
                  </p>
                )
              ) : (
                <p>
                  <span className="custom-bold-text">Skills: </span>
                  <span className="skill-text">Sem skills</span>
                </p>
              )}
            </li>
          );
        })}
    </Container>
  );
};

export default WorkersList;
