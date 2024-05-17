import { SocketContext } from "@/contexts/SocketContext";
import api from "@/utils/axios";
import { useContext, useEffect, useState } from "react";
import UserPreview from "../userPreview";
import { useRouter } from "next/router";
import { Direct } from "./directPreview";
import Loading from "../loading";
import './directDetails.css';


interface DirectDetailsProps {
  self: string;
  login: string;
}

const DirectDetails: React.FC<DirectDetailsProps> = ({ self, login }) => {
  const { socket } = useContext(SocketContext);
  const router = useRouter();
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('offline');
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [deletedAt, setDeletedAt] = useState<Date | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [isResponse, setIsResponse] = useState(false);

  useEffect(() => {
    if (self && login) {
      const handleHideDetails = (direct: Direct) => {
        if (login === direct.login) {
          setIsHidden(true);
        }
      }

      const getDirectDetails = () => {
        api
          .get(`/chat/${login}/details`)
          .then(response => {
            setIsResponse(true);
            setFirstName(response.data.firstname);
            setLastName(response.data.lastname);
            setEmail(response.data.email);
            setNickname(response.data.nickname);
            setBio(response.data.bio);
            setStatus(response.data.status);
            setCreatedAt(response.data.created_at);
            setUpdatedAt(response.data.updated_at);
            setDeletedAt(response.data.deleted_at);
          })
          .catch(error => {
            setIsResponse(false);
            // console.log('error channel details: ', error);
          })
      }

      getDirectDetails();

      if (socket) {
        // socket.on('error', (error: any) => {
        //   console.log('error: ', error);
        // });

        socket.emit('showDirect', {
          login: login,
        });

        socket.on('hiddenDirect', handleHideDetails);
      }

      return (() => {
        if (socket) {
          socket.off('hiddenDirect', handleHideDetails);
        }
      });
    }
  }, [self, login, socket]);

  const handleHideDirect = () => {
    if (socket) {
      socket.emit('hideDirect', {
        login: login,
      });
    }
  }

  if (isHidden) {
    router.push('/chat');
    return (
      <Loading />
    );
  } else if (isResponse && login && status) {
    return (
      <div className="direct_details_main ">
        <div>
          <h1>user</h1>
          <UserPreview user={ {
            login: login,
            nickname: nickname,
            status: status,
            } }
          />
          <button className="hide_button" onClick={handleHideDirect}>Hide</button>
        </div>
      </div>
    );
  } else {
    return (
      null
    );
  }
};

export default DirectDetails;
